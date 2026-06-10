import { Router } from "express";
import { db } from "@workspace/db";
import { walletsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { NEXA_PRICE_USD } from "./auth";
import { getLivePrices } from "../services/prices";

const router = Router();

router.get("/wallet", requireAuth, async (req, res) => {
  try {
    const [w] = await db.select().from(walletsTable).where(eq(walletsTable.userId, req.user!.userId));
    if (!w) return res.status(404).json({ error: "Wallet not found" });

    const prices = await getLivePrices();
    const nexa = parseFloat(w.balanceNexa);
    const btc = parseFloat(w.balanceBtc);
    const eth = parseFloat(w.balanceEth);
    const usdt = parseFloat(w.balanceUsdt);
    const totalUsd = nexa * NEXA_PRICE_USD + btc * prices.btcUsd + eth * prices.ethUsd + usdt;

    return res.json({
      id: w.id,
      address: w.address,
      balanceNexa: nexa,
      balanceEur: nexa * 100,
      balanceUsd: parseFloat(totalUsd.toFixed(2)),
      balanceBtc: btc,
      balanceEth: eth,
      balanceUsdt: usdt,
      kycStatus: w.kycStatus,
      nexaPriceEur: 100,
      nexaPriceUsd: NEXA_PRICE_USD,
      btcPriceUsd: prices.btcUsd,
      ethPriceUsd: prices.ethUsd,
      createdAt: w.createdAt,
    });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
