import { Router } from "express";
import { db } from "@workspace/db";
import { cardsTable, cardSpendTable, walletsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/card", requireAuth, async (req, res) => {
  try {
    const [card] = await db.select().from(cardsTable).where(eq(cardsTable.walletId, req.user!.walletId));
    if (!card) return res.status(404).json({ error: "No card found" });

    const spends = await db.select().from(cardSpendTable).where(eq(cardSpendTable.cardId, card.id))
      .orderBy(desc(cardSpendTable.createdAt)).limit(20);

    return res.json({
      id: card.id,
      last4: card.last4,
      network: card.network,
      status: card.status,
      spendLimitUsd: parseFloat(card.spendLimitUsd),
      availableUsd: parseFloat(card.availableUsd),
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      spendHistory: spends.map(s => ({
        id: s.id, merchantName: s.merchantName, amountUsd: parseFloat(s.amountUsd),
        category: s.category, status: s.status, createdAt: s.createdAt,
      })),
    });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/card/freeze", requireAuth, async (req, res) => {
  try {
    const [card] = await db.select().from(cardsTable).where(eq(cardsTable.walletId, req.user!.walletId));
    if (!card) return res.status(404).json({ error: "No card found" });
    const newStatus = card.status === "frozen" ? "active" : "frozen";
    await db.update(cardsTable).set({ status: newStatus as any }).where(eq(cardsTable.id, card.id));
    return res.json({ status: newStatus });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
