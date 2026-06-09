import { Router } from "express";
import { db } from "@workspace/db";
import { merchantsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateMerchantBody, GetMerchantParams, UpdateMerchantBody, UpdateMerchantParams } from "@workspace/api-zod";

const router = Router();

// GET /merchants
router.get("/merchants", async (req, res) => {
  try {
    const merchants = await db.select().from(merchantsTable).orderBy(merchantsTable.createdAt);
    res.json(merchants.map((m) => ({
      id: m.id,
      businessName: m.businessName,
      settlementAddress: m.settlementAddress,
      category: m.category,
      totalVolume: parseFloat(m.totalVolume),
      transactionCount: m.transactionCount,
      isActive: m.isActive,
      createdAt: m.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /merchants
router.post("/merchants", async (req, res) => {
  try {
    const parsed = CreateMerchantBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }
    const [m] = await db.insert(merchantsTable).values({
      businessName: parsed.data.businessName,
      settlementAddress: parsed.data.settlementAddress,
      category: parsed.data.category,
      isActive: true,
    }).returning();
    res.status(201).json({
      id: m.id,
      businessName: m.businessName,
      settlementAddress: m.settlementAddress,
      category: m.category,
      totalVolume: parseFloat(m.totalVolume),
      transactionCount: m.transactionCount,
      isActive: m.isActive,
      createdAt: m.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /merchants/:id
router.get("/merchants/:id", async (req, res) => {
  try {
    const parsed = GetMerchantParams.safeParse(req.params);
    if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
    const [m] = await db.select().from(merchantsTable).where(eq(merchantsTable.id, parsed.data.id));
    if (!m) return res.status(404).json({ error: "Merchant not found" });
    res.json({
      id: m.id,
      businessName: m.businessName,
      settlementAddress: m.settlementAddress,
      category: m.category,
      totalVolume: parseFloat(m.totalVolume),
      transactionCount: m.transactionCount,
      isActive: m.isActive,
      createdAt: m.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /merchants/:id
router.patch("/merchants/:id", async (req, res) => {
  try {
    const params = UpdateMerchantParams.safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: "Invalid id" });
    const body = UpdateMerchantBody.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: "Invalid request body" });

    const updates: Record<string, any> = {};
    if (body.data.businessName !== undefined) updates.businessName = body.data.businessName;
    if (body.data.category !== undefined) updates.category = body.data.category;
    if (body.data.isActive !== undefined) updates.isActive = body.data.isActive;

    const [m] = await db.update(merchantsTable).set(updates).where(eq(merchantsTable.id, params.data.id)).returning();
    if (!m) return res.status(404).json({ error: "Merchant not found" });
    res.json({
      id: m.id,
      businessName: m.businessName,
      settlementAddress: m.settlementAddress,
      category: m.category,
      totalVolume: parseFloat(m.totalVolume),
      transactionCount: m.transactionCount,
      isActive: m.isActive,
      createdAt: m.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
