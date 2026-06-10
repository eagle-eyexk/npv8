import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable, walletsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { NEXA_PRICE_USD } from "./auth";
import { v4 as uuidv4 } from "uuid";

const router = Router();

function formatTx(t: any) {
  return {
    id: t.id,
    type: t.type,
    amount: parseFloat(t.amount),
    amountUsd: parseFloat(t.amountUsd),
    amountEur: parseFloat(t.amount) * 100,
    fromAddress: t.fromAddress,
    toAddress: t.toAddress,
    merchantName: t.merchantName,
    status: t.status,
    txHash: t.txHash,
    createdAt: t.createdAt,
  };
}

router.get("/transactions", requireAuth, async (req, res) => {
  try {
    const limit = parseInt(String(req.query.limit ?? 20));
    const offset = parseInt(String(req.query.offset ?? 0));
    const type = req.query.type as string | undefined;
    const walletId = req.user!.walletId;

    const conditions: any[] = [eq(transactionsTable.walletId, walletId)];
    if (type) conditions.push(eq(transactionsTable.type, type as any));

    const rows = await db.select().from(transactionsTable)
      .where(and(...conditions))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(limit)
      .offset(offset);

    return res.json(rows.map(formatTx));
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/transactions", requireAuth, async (req, res) => {
  try {
    const { toAddress, amount, memo } = req.body;
    if (!toAddress || !amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: "toAddress and amount are required" });
    }
    const numAmount = parseFloat(amount);
    const walletId = req.user!.walletId;

    const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.id, walletId));
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    const current = parseFloat(wallet.balanceNexa);
    if (current < numAmount) return res.status(400).json({ error: "Insufficient NEXA balance" });

    await db.update(walletsTable).set({
      balanceNexa: String((current - numAmount).toFixed(8)),
    }).where(eq(walletsTable.id, walletId));

    const txHash = "0x" + uuidv4().replace(/-/g, "").substring(0, 40);
    const [tx] = await db.insert(transactionsTable).values({
      walletId,
      type: "send",
      amount: String(numAmount),
      amountUsd: String((numAmount * NEXA_PRICE_USD).toFixed(4)),
      toAddress,
      fromAddress: wallet.address,
      merchantName: memo ?? null,
      status: "confirmed",
      txHash,
    }).returning();

    return res.status(201).json(formatTx(tx));
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/transactions/:id", requireAuth, async (req, res) => {
  try {
    const [tx] = await db.select().from(transactionsTable)
      .where(and(eq(transactionsTable.id, req.params.id), eq(transactionsTable.walletId, req.user!.walletId)));
    if (!tx) return res.status(404).json({ error: "Not found" });
    return res.json(formatTx(tx));
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
