import { Router } from "express";
import { db } from "@workspace/db";
import { walletsTable, transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { NEXA_PRICE_USD } from "./auth";

const router = Router();

const MINING_REWARD = 0.0001;
const MIN_INTERVAL_MS = 25000;

router.post("/mining/claim", requireAuth, async (req, res) => {
  try {
    const walletId = req.user!.walletId;
    const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.id, walletId));
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    const now = new Date();
    const last = wallet.lastMiningAt ? new Date(wallet.lastMiningAt).getTime() : 0;
    const elapsed = now.getTime() - last;

    if (elapsed < MIN_INTERVAL_MS) {
      return res.status(429).json({
        error: "Too fast — wait before next claim",
        retryAfter: Math.ceil((MIN_INTERVAL_MS - elapsed) / 1000),
      });
    }

    const newBalance = (parseFloat(wallet.balanceNexa) + MINING_REWARD).toFixed(8);
    await db.update(walletsTable)
      .set({ balanceNexa: newBalance, lastMiningAt: now })
      .where(eq(walletsTable.id, walletId));

    await db.insert(transactionsTable).values({
      walletId,
      type: "mining",
      amount: String(MINING_REWARD),
      amountUsd: String((MINING_REWARD * NEXA_PRICE_USD).toFixed(4)),
      fromAddress: "mining-pool",
      toAddress: wallet.address,
      merchantName: "Nexa Mining Pool",
      status: "confirmed",
      txHash: "0xmine" + now.getTime().toString(16),
    });

    return res.json({
      reward: MINING_REWARD,
      rewardEur: MINING_REWARD * 100,
      newBalance: parseFloat(newBalance),
    });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/mining/stats", requireAuth, async (req, res) => {
  try {
    const [wallet] = await db.select({ lastMiningAt: walletsTable.lastMiningAt })
      .from(walletsTable).where(eq(walletsTable.id, req.user!.walletId));
    const last = wallet?.lastMiningAt ? new Date(wallet.lastMiningAt).getTime() : null;
    const elapsed = last ? Date.now() - last : null;
    return res.json({
      active: elapsed !== null && elapsed < 60000,
      rewardPerClaim: MINING_REWARD,
      rewardPerClaimEur: MINING_REWARD * 100,
      lastClaim: last ? new Date(last).toISOString() : null,
      nextClaimInMs: elapsed !== null ? Math.max(0, MIN_INTERVAL_MS - elapsed) : 0,
    });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
