import { Router } from "express";
import { db } from "@workspace/db";
import { cardsTable, cardSpendTable } from "@workspace/db";
import { ListCardSpendQueryParams } from "@workspace/api-zod";
import { desc } from "drizzle-orm";

const router = Router();

// GET /card
router.get("/card", async (req, res) => {
  try {
    const cards = await db.select().from(cardsTable).limit(1);
    if (!cards.length) return res.status(404).json({ error: "No card found" });
    const c = cards[0];
    res.json({
      id: c.id,
      last4: c.last4,
      network: c.network,
      status: c.status,
      spendLimitUsd: parseFloat(c.spendLimitUsd),
      availableUsd: parseFloat(c.availableUsd),
      expiryMonth: c.expiryMonth,
      expiryYear: c.expiryYear,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /card/spend
router.get("/card/spend", async (req, res) => {
  try {
    const parsed = ListCardSpendQueryParams.safeParse(req.query);
    const limit = parsed.success ? (parsed.data.limit ?? 10) : 10;
    const rows = await db.select().from(cardSpendTable).orderBy(desc(cardSpendTable.createdAt)).limit(limit);
    res.json(rows.map((s) => ({
      id: s.id,
      merchantName: s.merchantName,
      amountUsd: parseFloat(s.amountUsd),
      category: s.category,
      status: s.status,
      createdAt: s.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
