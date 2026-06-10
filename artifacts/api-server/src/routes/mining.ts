import { Router } from "express";
import { db } from "@workspace/db";
import { walletsTable, transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { NEXA_PRICE_USD } from "./auth";

const router = Router();

const MINING_REWARD = 0.0001; // NEXA per claim
const MIN_INTERVAL_MS = 25000; // 25 seconds minimum between claims
const lastClaim = new Map<string, number>();

router.post("/mining/claim", requireAuth, async (req, res) => {
  try {
    const walletId = req.user!.walletId;
    const now = Date.now();
    const last = lastClaim.get(walletId) ?? 0;
    if (now - last < MIN_INTERVAL_MS) {
      return res.status(429).json({ error: "Too fast — wait before next claim", retryAfter: Math.ceil((MIN_INTERVAL_MS - (now - last)) / 1000) });
    }
    lastClaim.set(walletId, now);

    const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.id, walletId));
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    const newBalance = (parseFloat(wallet.balanceNexa) + MINING_REWARD).toFixed(8);
    await db.update(walletsTable).set({ balanceNexa: newBalance }).where(eq(walletsTable.id, walletId));

    await db.insert(transactionsTable).values({
      walletId,
      type: "mining",
      amount: String(MINING_REWARD),
      amountUsd: String((MINING_REWARD * NEXA_PRICE_USD).toFixed(4)),
      fromAddress: "mining-pool",
      toAddress: wallet.address,
      merchantName: "Nexa Mining Pool",
      status: "confirmed",
      txHash: "0xmine" + Date.now().toString(16),
    });

    return res.json({
      reward: MINING_REWARD,
      rewardEur: MINING_REWARD * 100,
      newBalance: parseFloat(newBalance),
    });
  } catch { return res.status(500).json({ error: "Internal server error" }); }
});

router.get("/mining/stats", requireAuth, async (req, res) => {
  try {
    const walletId = req.user!.walletId;
    const last = lastClaim.get(walletId);
    return res.json({
      active: !!last && Date.now() - last < 60000,
      rewardPerClaim: MINING_REWARD,
      rewardPerClaimEur: MINING_REWARD * 100,
      lastClaim: last ? new Date(last).toISOString() : null,
    });
  } catch { return res.status(500).json({ error: "Internal server error" }); }
});

export default router;
