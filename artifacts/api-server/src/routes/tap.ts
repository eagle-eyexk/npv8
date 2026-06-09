import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable, merchantsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ClaimTapPaymentBody, GenerateTapTokenBody } from "@workspace/api-zod";
import crypto from "crypto";

const router = Router();
const NEXA_PRICE_USD = 0.0842;

// POST /tap/generate — user generates a tap token
router.post("/tap/generate", async (req, res) => {
  try {
    const parsed = GenerateTapTokenBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });
    const { amount, merchantId } = parsed.data;
    const nonce = Math.floor(Math.random() * 1_000_000_000);
    const expiresAt = new Date(Date.now() + 60_000); // 60s
    const token = crypto.randomBytes(32).toString("hex");
    res.status(201).json({ token, expiresAt: expiresAt.toISOString(), nonce, amount });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /tap/claim — merchant claims a tap payment
router.post("/tap/claim", async (req, res) => {
  try {
    const parsed = ClaimTapPaymentBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });
    const { amount, merchantId } = parsed.data;

    const [merchant] = await db.select().from(merchantsTable).where(eq(merchantsTable.id, merchantId));
    const merchantName = merchant?.businessName ?? "Unknown Merchant";
    const amountUsd = amount * NEXA_PRICE_USD;
    const txHash = "0x" + crypto.randomBytes(20).toString("hex");

    const [tx] = await db.insert(transactionsTable).values({
      type: "tap_pay",
      amount: String(amount),
      amountUsd: String(amountUsd.toFixed(4)),
      toAddress: merchant?.settlementAddress,
      merchantName,
      status: "confirmed",
      txHash,
    }).returning();

    // Update merchant volume
    if (merchant) {
      await db.update(merchantsTable).set({
        totalVolume: String(parseFloat(merchant.totalVolume) + amount),
        transactionCount: merchant.transactionCount + 1,
      }).where(eq(merchantsTable.id, merchantId));
    }

    res.json({ status: "success", txHash, amount });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
