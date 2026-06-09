import { Router } from "express";
import { db } from "@workspace/db";
import { walletsTable } from "@workspace/db";

const router = Router();

// GET /wallet — return the first wallet (single-user MVP)
router.get("/wallet", async (req, res) => {
  try {
    const wallets = await db.select().from(walletsTable).limit(1);
    if (!wallets.length) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    const w = wallets[0];
    res.json({
      id: w.id,
      address: w.address,
      balanceNexa: parseFloat(w.balanceNexa),
      balanceUsd: parseFloat(w.balanceUsd),
      kycStatus: w.kycStatus,
      createdAt: w.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
