import { Router } from "express";
import { db } from "@workspace/db";
import { merchantsTable, walletsTable, tapTokensTable, transactionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { NEXA_PRICE_USD } from "./auth";

const router = Router();

router.get("/merchants", async (_req, res) => {
  try {
    const rows = await db.select().from(merchantsTable).where(eq(merchantsTable.isActive, true)).limit(50);
    return res.json(rows.map(m => ({
      id: m.id,
      businessName: m.businessName,
      settlementAddress: m.settlementAddress,
      category: m.category,
      totalVolume: parseFloat(m.totalVolume),
      transactionCount: m.transactionCount,
      isActive: m.isActive,
      createdAt: m.createdAt,
    })));
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/merchants/my", requireAuth, async (req, res) => {
  try {
    const [m] = await db.select().from(merchantsTable).where(eq(merchantsTable.userId, req.user!.userId));
    if (!m) return res.status(404).json({ error: "No merchant profile found" });
    const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.id, m.walletId!));
    const recentTx = await db.select().from(transactionsTable).where(eq(transactionsTable.walletId, m.walletId!)).orderBy(desc(transactionsTable.createdAt)).limit(10);
    return res.json({
      merchant: {
        id: m.id, businessName: m.businessName, settlementAddress: m.settlementAddress,
        category: m.category, totalVolume: parseFloat(m.totalVolume), transactionCount: m.transactionCount,
        isActive: m.isActive, createdAt: m.createdAt,
      },
      wallet: wallet ? {
        balanceNexa: parseFloat(wallet.balanceNexa),
        balanceEur: parseFloat(wallet.balanceNexa) * 100,
      } : null,
      recentTransactions: recentTx.map(t => ({
        id: t.id, type: t.type, amount: parseFloat(t.amount),
        amountEur: parseFloat(t.amount) * 100, merchantName: t.merchantName,
        status: t.status, createdAt: t.createdAt,
      })),
    });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/merchants/:id", async (req, res) => {
  try {
    const [m] = await db.select().from(merchantsTable).where(eq(merchantsTable.id, req.params.id));
    if (!m) return res.status(404).json({ error: "Merchant not found" });
    return res.json({ id: m.id, businessName: m.businessName, settlementAddress: m.settlementAddress, category: m.category, isActive: m.isActive });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/merchants", requireAuth, async (req, res) => {
  try {
    const { businessName, settlementAddress, category } = req.body;
    if (!businessName || !settlementAddress) return res.status(400).json({ error: "businessName and settlementAddress required" });
    const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.id, req.user!.walletId));
    const [m] = await db.insert(merchantsTable).values({
      userId: req.user!.userId,
      walletId: req.user!.walletId,
      businessName, settlementAddress,
      category: category ?? "Services",
      isActive: true,
    }).returning();
    return res.status(201).json({ id: m.id, businessName: m.businessName });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
