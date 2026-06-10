import { Router } from "express";
import { getLivePrices } from "../services/prices";
import { NEXA_PRICE_USD } from "./auth";

const router = Router();

router.get("/prices", async (_req, res) => {
  try {
    const { btcUsd, ethUsd } = await getLivePrices();
    return res.json({
      nexa: { eur: 100, usd: NEXA_PRICE_USD },
      btc: { usd: btcUsd },
      eth: { usd: ethUsd },
      usdt: { usd: 1 },
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return res.status(500).json({ error: "Failed to fetch prices" });
  }
});

export default router;
