import { Router } from "express";
import { db } from "@workspace/db";
import { tapTokensTable, walletsTable, merchantsTable, transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { NEXA_PRICE_USD } from "./auth";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.post("/tap/generate", requireAuth, async (req, res) => {
  try {
    const { amount, merchantId } = req.body;
    if (!amount || !merchantId) return res.status(400).json({ error: "amount and merchantId required" });
    const numAmount = parseFloat(amount);
    const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.id, req.user!.walletId));
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });
    if (parseFloat(wallet.balanceNexa) < numAmount) return res.status(400).json({ error: "Insufficient balance" });
    const [merchant] = await db.select().from(merchantsTable).where(eq(merchantsTable.id, merchantId));
    if (!merchant) return res.status(404).json({ error: "Merchant not found" });
    const token = crypto.randomBytes(32).toString("hex");
    const nonce = Math.floor(Math.random() * 1000000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const [tt] = await db.insert(tapTokensTable).values({
      token, walletId: req.user!.walletId, merchantId, nonce,
      amount: String(numAmount), expiresAt, status: "pending",
    }).returning();
    return res.status(201).json({ token: tt.token, expiresAt, nonce, amount: numAmount, amountEur: numAmount * 100 });
  } catch { return res.status(500).json({ error: "Internal server error" }); }
});

router.post("/tap/claim", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "token required" });
    const [tt] = await db.select().from(tapTokensTable).where(eq(tapTokensTable.token, token));
    if (!tt) return res.status(404).json({ error: "Token not found" });
    if (tt.status !== "pending") return res.status(400).json({ error: `Token already ${tt.status}` });
    if (new Date() > new Date(tt.expiresAt)) {
      await db.update(tapTokensTable).set({ status: "expired" }).where(eq(tapTokensTable.id, tt.id));
      return res.status(400).json({ error: "Token expired" });
    }
    const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.id, tt.walletId));
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });
    const numAmount = parseFloat(tt.amount);
    if (parseFloat(wallet.balanceNexa) < numAmount) return res.status(400).json({ error: "Insufficient balance" });
    await db.update(walletsTable).set({ balanceNexa: String((parseFloat(wallet.balanceNexa) - numAmount).toFixed(8)) }).where(eq(walletsTable.id, tt.walletId));
    const [merchant] = await db.select().from(merchantsTable).where(eq(merchantsTable.id, tt.merchantId));
    if (merchant?.walletId) {
      const [mw] = await db.select().from(walletsTable).where(eq(walletsTable.id, merchant.walletId));
      if (mw) await db.update(walletsTable).set({ balanceNexa: String((parseFloat(mw.balanceNexa) + numAmount).toFixed(8)) }).where(eq(walletsTable.id, mw.id));
      await db.update(merchantsTable).set({ totalVolume: String((parseFloat(merchant.totalVolume) + numAmount).toFixed(8)), transactionCount: merchant.transactionCount + 1 }).where(eq(merchantsTable.id, tt.merchantId));
    }
    await db.update(tapTokensTable).set({ status: "claimed", claimedAt: new Date() }).where(eq(tapTokensTable.id, tt.id));
    const txHash = "0x" + uuidv4().replace(/-/g, "").substring(0, 40);
    const [tx] = await db.insert(transactionsTable).values({
      walletId: tt.walletId, type: "tap_pay", amount: tt.amount,
      amountUsd: String((numAmount * NEXA_PRICE_USD).toFixed(4)),
      fromAddress: wallet.address, toAddress: merchant?.settlementAddress ?? "",
      merchantName: merchant?.businessName ?? "Merchant", status: "confirmed", txHash,
    }).returning();
    return res.json({ success: true, txHash, amount: numAmount, amountEur: numAmount * 100, merchant: merchant?.businessName });
  } catch { return res.status(500).json({ error: "Internal server error" }); }
});

router.post("/tap/quick", requireAuth, async (req, res) => {
  try {
    const { amount, merchantId } = req.body;
    if (!amount || !merchantId) return res.status(400).json({ error: "amount and merchantId required" });
    const numAmount = parseFloat(amount);
    const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.id, req.user!.walletId));
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });
    if (parseFloat(wallet.balanceNexa) < numAmount) return res.status(400).json({ error: "Insufficient balance" });
    const [merchant] = await db.select().from(merchantsTable).where(eq(merchantsTable.id, merchantId));
    if (!merchant) return res.status(404).json({ error: "Merchant not found" });
    await db.update(walletsTable).set({ balanceNexa: String((parseFloat(wallet.balanceNexa) - numAmount).toFixed(8)) }).where(eq(walletsTable.id, req.user!.walletId));
    if (merchant.walletId) {
      const [mw] = await db.select().from(walletsTable).where(eq(walletsTable.id, merchant.walletId));
      if (mw) await db.update(walletsTable).set({ balanceNexa: String((parseFloat(mw.balanceNexa) + numAmount).toFixed(8)) }).where(eq(walletsTable.id, mw.id));
      await db.update(merchantsTable).set({ totalVolume: String((parseFloat(merchant.totalVolume) + numAmount).toFixed(8)), transactionCount: merchant.transactionCount + 1 }).where(eq(merchantsTable.id, merchantId));
    }
    const txHash = "0x" + uuidv4().replace(/-/g, "").substring(0, 40);
    await db.insert(transactionsTable).values({
      walletId: req.user!.walletId, type: "tap_pay", amount: String(numAmount),
      amountUsd: String((numAmount * NEXA_PRICE_USD).toFixed(4)),
      fromAddress: wallet.address, toAddress: merchant.settlementAddress,
      merchantName: merchant.businessName, status: "confirmed", txHash,
    });
    return res.json({ success: true, txHash, amount: numAmount, amountEur: numAmount * 100, merchant: merchant.businessName });
  } catch { return res.status(500).json({ error: "Internal server error" }); }
});

export default router;
