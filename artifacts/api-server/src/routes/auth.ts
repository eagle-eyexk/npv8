import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, walletsTable, merchantsTable, cardsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, signToken, signAdminToken } from "../middleware/auth";
import crypto from "crypto";

const router = Router();

export const NEXA_PRICE_EUR = 100;
export const EUR_TO_USD = 1.08;
export const NEXA_PRICE_USD = NEXA_PRICE_EUR * EUR_TO_USD;

const PHRASE_WORDS = [
  "access","adapt","agent","alpha","anchor","arctic","array","asset",
  "beacon","binary","blade","blend","bloom","board","bright","build",
  "cache","carry","chart","circle","claim","clean","cloud","code",
  "connect","coral","core","craft","credit","crest","crisp","cross",
  "data","delta","design","digit","direct","dome","draft","drive",
  "echo","edge","ember","encode","entry","epoch","equal","event",
  "field","filter","final","first","flash","float","focus","forge",
  "frame","fresh","frost","fuel","fusion","globe","grant","graph",
  "green","grid","group","guard","guide","hash","haven","heal",
  "helix","image","index","inner","input","layer","light","limit",
  "link","logic","lunar","merge","mesh","mint","model","nexus",
  "north","occur","omega","open","orbit","order","parse","patch",
  "phase","pivot","pixel","plain","point","power","prime","proof",
  "proxy","pulse","quest","raise","reach","realm","relay","reset",
  "route","scale","scout","seal","share","shift","sigma","smart",
  "solid","space","spark","speed","stack","store","storm","trust",
];

function generateAddress(): string {
  return "nexa1" + crypto.randomBytes(20).toString("hex");
}

function generateRecoveryPhrase(): string {
  const bytes = crypto.randomBytes(12);
  return Array.from(bytes).map(b => PHRASE_WORDS[b % PHRASE_WORDS.length]).join(" ");
}

router.post("/auth/register", async (req, res) => {
  try {
    const { email, password, fullName, role = "user" } = req.body;
    if (!email || !password || !fullName)
      return res.status(400).json({ error: "email, password and fullName are required" });
    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim()));
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(usersTable).values({
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName: fullName.trim(),
      role,
    }).returning();

    const address = generateAddress();
    const recoveryPhrase = generateRecoveryPhrase();
    const recoveryPhraseHash = await bcrypt.hash(recoveryPhrase, 10);

    const [wallet] = await db.insert(walletsTable).values({
      userId: user.id,
      address,
      balanceNexa: "0.00000000",
      balanceBtc: "0.00000000",
      balanceEth: "0.00000000",
      balanceUsdt: "0.00000000",
      balanceUsd: "0",
      recoveryPhraseHash,
    }).returning();

    let merchant = null;
    if (role === "merchant") {
      [merchant] = await db.insert(merchantsTable).values({
        userId: user.id,
        walletId: wallet.id,
        businessName: fullName.trim() + "'s Business",
        settlementAddress: address,
        category: "Services",
        isActive: true,
      }).returning();
    }

    const last4 = String(Math.floor(1000 + Math.random() * 9000));
    await db.insert(cardsTable).values({
      walletId: wallet.id,
      last4,
      network: "Visa",
      status: "active",
      spendLimitUsd: "0",
      availableUsd: "0",
      expiryMonth: 12,
      expiryYear: 2028,
    });

    const token = signToken({ userId: user.id, role: user.role as any, walletId: wallet.id });
    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      wallet: { id: wallet.id, address: wallet.address },
      merchant: merchant ? { id: merchant.id, businessName: merchant.businessName } : null,
      recoveryPhrase,
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim()));
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (user.isFrozen === "true") return res.status(403).json({ error: "Account is frozen. Contact support." });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id));
    if (!wallet) return res.status(500).json({ error: "Wallet not found" });

    let merchantId: string | null = null;
    if (user.role === "merchant") {
      const [m] = await db.select().from(merchantsTable).where(eq(merchantsTable.userId, user.id));
      merchantId = m?.id ?? null;
    }

    const token = signToken({ userId: user.id, role: user.role as any, walletId: wallet.id });
    return res.json({
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      wallet: { id: wallet.id, address: wallet.address },
      merchantId,
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
    if (!user) return res.status(404).json({ error: "User not found" });

    const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id));
    let merchantId: string | null = null;
    if (user.role === "merchant") {
      const [m] = await db.select().from(merchantsTable).where(eq(merchantsTable.userId, user.id));
      merchantId = m?.id ?? null;
    }

    return res.json({
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      wallet: { id: wallet.id, address: wallet.address },
      merchantId,
    });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (username === "root" && password === "Jari!!2018") {
    const token = signAdminToken();
    return res.json({ token, username: "root" });
  }
  return res.status(401).json({ error: "Invalid admin credentials" });
});

export default router;
