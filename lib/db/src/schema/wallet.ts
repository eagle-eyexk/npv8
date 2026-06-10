import { pgTable, text, uuid, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const kycStatusEnum = pgEnum("kyc_status", ["pending", "approved", "rejected"]);

export const walletsTable = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id),
  address: text("address").notNull().unique(),
  balanceNexa: numeric("balance_nexa", { precision: 30, scale: 8 }).notNull().default("0.00000000"),
  balanceBtc: numeric("balance_btc", { precision: 30, scale: 8 }).notNull().default("0.00000000"),
  balanceEth: numeric("balance_eth", { precision: 30, scale: 8 }).notNull().default("0.00000000"),
  balanceUsdt: numeric("balance_usdt", { precision: 30, scale: 8 }).notNull().default("0.00000000"),
  balanceUsd: numeric("balance_usd", { precision: 20, scale: 4 }).notNull().default("0"),
  kycStatus: kycStatusEnum("kyc_status").notNull().default("approved"),
  lastMiningAt: timestamp("last_mining_at"),
  recoveryPhraseHash: text("recovery_phrase_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWalletSchema = createInsertSchema(walletsTable).omit({ id: true, createdAt: true });
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof walletsTable.$inferSelect;
