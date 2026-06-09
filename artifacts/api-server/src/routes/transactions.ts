import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable } from "@workspace/db";
import { eq, desc, and, SQL } from "drizzle-orm";
import { CreateTransactionBody, ListTransactionsQueryParams } from "@workspace/api-zod";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const NEXA_PRICE_USD = 0.0842;

// GET /transactions
router.get("/transactions", async (req, res) => {
  try {
    const parsed = ListTransactionsQueryParams.safeParse(req.query);
    const limit = parsed.success ? (parsed.data.limit ?? 20) : 20;
    const offset = parsed.success ? (parsed.data.offset ?? 0) : 0;
    const type = parsed.success ? parsed.data.type : undefined;

    let query = db.select().from(transactionsTable).orderBy(desc(transactionsTable.createdAt));

    const rows = await (type
      ? db.select().from(transactionsTable).where(eq(transactionsTable.type, type as any)).orderBy(desc(transactionsTable.createdAt)).limit(limit).offset(offset)
      : db.select().from(transactionsTable).orderBy(desc(transactionsTable.createdAt)).limit(limit).offset(offset));

    res.json(rows.map((t) => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(t.amount),
      amountUsd: parseFloat(t.amountUsd),
      fromAddress: t.fromAddress,
      toAddress: t.toAddress,
      merchantName: t.merchantName,
      status: t.status,
      txHash: t.txHash,
      createdAt: t.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /transactions
router.post("/transactions", async (req, res) => {
  try {
    const parsed = CreateTransactionBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }
    const { toAddress, amount } = parsed.data;
    const amountUsd = amount * NEXA_PRICE_USD;
    const txHash = "0x" + Buffer.from(uuidv4()).toString("hex").substring(0, 40);

    const [tx] = await db.insert(transactionsTable).values({
      type: "send",
      amount: String(amount),
      amountUsd: String(amountUsd.toFixed(4)),
      toAddress,
      status: "confirmed",
      txHash,
    }).returning();

    res.status(201).json({
      id: tx.id,
      type: tx.type,
      amount: parseFloat(tx.amount),
      amountUsd: parseFloat(tx.amountUsd),
      fromAddress: tx.fromAddress,
      toAddress: tx.toAddress,
      merchantName: tx.merchantName,
      status: tx.status,
      txHash: tx.txHash,
      createdAt: tx.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /transactions/:id
router.get("/transactions/:id", async (req, res) => {
  try {
    const [tx] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, req.params.id));
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    res.json({
      id: tx.id,
      type: tx.type,
      amount: parseFloat(tx.amount),
      amountUsd: parseFloat(tx.amountUsd),
      fromAddress: tx.fromAddress,
      toAddress: tx.toAddress,
      merchantName: tx.merchantName,
      status: tx.status,
      txHash: tx.txHash,
      createdAt: tx.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
