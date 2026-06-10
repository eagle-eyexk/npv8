import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, walletsTable, transactionsTable, merchantsTable } from "@workspace/db";
import { desc, sql, eq } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";
import { NEXA_PRICE_USD } from "./auth";

const router = Router();

router.get("/admin/stats", requireAdmin, async (_req, res) => {
  try {
    const [users] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
    const [merchants] = await db.select({ count: sql<number>`count(*)::int` }).from(merchantsTable);
    const [txCount] = await db.select({ count: sql<number>`count(*)::int` }).from(transactionsTable);
    const [totalVol] = await db.select({ total: sql<string>`coalesce(sum(amount::numeric),0)` }).from(transactionsTable);
    const [totalNexa] = await db.select({ total: sql<string>`coalesce(sum(balance_nexa::numeric),0)` }).from(walletsTable);
    return res.json({
      totalUsers: users.count,
      totalMerchants: merchants.count,
      totalTransactions: txCount.count,
      totalVolumeNexa: parseFloat(totalVol.total),
      totalVolumeEur: parseFloat(totalVol.total) * 100,
      totalNexaInCirculation: parseFloat(totalNexa.total),
      nexaPriceEur: 100,
      nexaPriceUsd: NEXA_PRICE_USD,
    });
  } catch { return res.status(500).json({ error: "Internal server error" }); }
});

router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(String(req.query.limit ?? 50));
    const users = await db.select({
      id: usersTable.id, email: usersTable.email, fullName: usersTable.fullName,
      role: usersTable.role, isFrozen: usersTable.isFrozen, createdAt: usersTable.createdAt,
    }).from(usersTable).orderBy(desc(usersTable.createdAt)).limit(limit);

    const result = await Promise.all(users.map(async u => {
      const [w] = await db.select().from(walletsTable).where(eq(walletsTable.userId, u.id));
      return { ...u, wallet: w ? { id: w.id, address: w.address, balanceNexa: parseFloat(w.balanceNexa), balanceEur: parseFloat(w.balanceNexa) * 100 } : null };
    }));
    return res.json(result);
  } catch { return res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/admin/users/:id/freeze", requireAdmin, async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    const newFrozen = user.isFrozen === "true" ? "false" : "true";
    await db.update(usersTable).set({ isFrozen: newFrozen }).where(eq(usersTable.id, req.params.id));
    return res.json({ isFrozen: newFrozen === "true" });
  } catch { return res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/admin/wallets/:id/balance", requireAdmin, async (req, res) => {
  try {
    const { balanceNexa } = req.body;
    if (balanceNexa === undefined || isNaN(parseFloat(balanceNexa))) return res.status(400).json({ error: "balanceNexa required" });
    await db.update(walletsTable).set({ balanceNexa: String(parseFloat(balanceNexa).toFixed(8)) }).where(eq(walletsTable.id, req.params.id));
    return res.json({ success: true, balanceNexa: parseFloat(balanceNexa) });
  } catch { return res.status(500).json({ error: "Internal server error" }); }
});

router.get("/admin/transactions", requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(String(req.query.limit ?? 50));
    const rows = await db.select().from(transactionsTable).orderBy(desc(transactionsTable.createdAt)).limit(limit);
    return res.json(rows.map(t => ({
      id: t.id, type: t.type, amount: parseFloat(t.amount), amountEur: parseFloat(t.amount) * 100,
      walletId: t.walletId, merchantName: t.merchantName, status: t.status, createdAt: t.createdAt,
    })));
  } catch { return res.status(500).json({ error: "Internal server error" }); }
});

router.get("/admin/merchants", requireAdmin, async (req, res) => {
  try {
    const rows = await db.select().from(merchantsTable).orderBy(desc(merchantsTable.createdAt)).limit(100);
    return res.json(rows.map(m => ({
      id: m.id, businessName: m.businessName, category: m.category,
      totalVolume: parseFloat(m.totalVolume), totalVolumeEur: parseFloat(m.totalVolume) * 100,
      transactionCount: m.transactionCount, isActive: m.isActive, createdAt: m.createdAt,
    })));
  } catch { return res.status(500).json({ error: "Internal server error" }); }
});

export default router;
