import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable, walletsTable, merchantsTable } from "@workspace/db";
import { eq, desc, gte, sql } from "drizzle-orm";
import { GetRecentActivityQueryParams } from "@workspace/api-zod";

const router = Router();
const NEXA_PRICE_USD = 0.0842;

// GET /dashboard/summary
router.get("/dashboard/summary", async (req, res) => {
  try {
    const [wallet] = await db.select().from(walletsTable).limit(1);
    const txs = await db.select().from(transactionsTable);

    let totalSent = 0, totalReceived = 0, totalTapPay = 0, totalCardSpend = 0;
    for (const t of txs) {
      const amt = parseFloat(t.amountUsd);
      if (t.type === "send") totalSent += amt;
      if (t.type === "receive") totalReceived += amt;
      if (t.type === "tap_pay") totalTapPay += amt;
      if (t.type === "card_spend") totalCardSpend += amt;
    }

    const activeMerchantsResult = await db.select().from(merchantsTable).where(eq(merchantsTable.isActive, true));

    res.json({
      balanceNexa: wallet ? parseFloat(wallet.balanceNexa) : 0,
      balanceUsd: wallet ? parseFloat(wallet.balanceUsd) : 0,
      totalSent,
      totalReceived,
      totalTapPay,
      totalCardSpend,
      nexaPriceUsd: NEXA_PRICE_USD,
      priceChange24h: 3.47,
      activeMerchants: activeMerchantsResult.length,
      transactionCount: txs.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /dashboard/activity
router.get("/dashboard/activity", async (req, res) => {
  try {
    const parsed = GetRecentActivityQueryParams.safeParse(req.query);
    const limit = parsed.success ? (parsed.data.limit ?? 10) : 10;
    const txs = await db.select().from(transactionsTable).orderBy(desc(transactionsTable.createdAt)).limit(limit);

    const items = txs.map((t) => {
      let description = "";
      if (t.type === "send") description = `Sent ${parseFloat(t.amount).toFixed(2)} NEXA to ${t.toAddress?.slice(0, 12)}...`;
      else if (t.type === "receive") description = `Received ${parseFloat(t.amount).toFixed(2)} NEXA`;
      else if (t.type === "tap_pay") description = `Tap payment at ${t.merchantName ?? "merchant"}`;
      else if (t.type === "card_spend") description = `Card spend at ${t.merchantName ?? "merchant"}`;
      return {
        id: t.id,
        type: t.type,
        description,
        amount: parseFloat(t.amount),
        createdAt: t.createdAt,
      };
    });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /dashboard/volume — 30-day chart
router.get("/dashboard/volume", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const txs = await db.select().from(transactionsTable).where(gte(transactionsTable.createdAt, thirtyDaysAgo));

    const byDay: Record<string, { volume: number; txCount: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      byDay[key] = { volume: 0, txCount: 0 };
    }

    for (const t of txs) {
      const key = t.createdAt.toISOString().slice(0, 10);
      if (byDay[key]) {
        byDay[key].volume += parseFloat(t.amount);
        byDay[key].txCount += 1;
      }
    }

    res.json(Object.entries(byDay).map(([date, data]) => ({ date, ...data })));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
