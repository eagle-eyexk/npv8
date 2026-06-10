import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable, walletsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { NEXA_PRICE_USD } from "./auth";
import { getLivePrices } from "../services/prices";

const router = Router();

router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const walletId = req.user!.walletId;
    const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.id, walletId));
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    const prices = await getLivePrices();

    const recentTx = await db.select().from(transactionsTable)
      .where(eq(transactionsTable.walletId, walletId))
      .orderBy(desc(transactionsTable.createdAt)).limit(5);

    const [totalSent] = await db.select({ total: sql<string>`coalesce(sum(amount),0)` })
      .from(transactionsTable)
      .where(sql`wallet_id = ${walletId} AND type = 'send'`);
    const [totalReceived] = await db.select({ total: sql<string>`coalesce(sum(amount),0)` })
      .from(transactionsTable)
      .where(sql`wallet_id = ${walletId} AND type = 'receive'`);

    const nexa = parseFloat(wallet.balanceNexa);
    const btc = parseFloat(wallet.balanceBtc);
    const eth = parseFloat(wallet.balanceEth);
    const usdt = parseFloat(wallet.balanceUsdt);
    const totalUsd = nexa * NEXA_PRICE_USD + btc * prices.btcUsd + eth * prices.ethUsd + usdt;

    return res.json({
      wallet: {
        id: wallet.id,
        address: wallet.address,
        balanceNexa: nexa,
        balanceEur: nexa * 100,
        balanceUsd: parseFloat(totalUsd.toFixed(2)),
        balanceBtc: btc,
        balanceEth: eth,
        balanceUsdt: usdt,
        nexaPriceEur: 100,
        nexaPriceUsd: NEXA_PRICE_USD,
        btcPriceUsd: prices.btcUsd,
        ethPriceUsd: prices.ethUsd,
        kycStatus: wallet.kycStatus,
      },
      stats: {
        totalSent: parseFloat(totalSent?.total ?? "0"),
        totalReceived: parseFloat(totalReceived?.total ?? "0"),
        transactionCount: recentTx.length,
      },
      recentTransactions: recentTx.map(t => ({
        id: t.id, type: t.type, amount: parseFloat(t.amount),
        amountEur: parseFloat(t.amount) * 100,
        amountUsd: parseFloat(t.amountUsd),
        merchantName: t.merchantName, status: t.status, createdAt: t.createdAt,
        fromAddress: t.fromAddress, toAddress: t.toAddress,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
