import { pgTable, text, uuid, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const kycStatusEnum = pgEnum("kyc_status", ["pending", "approved", "rejected"]);

export const walletsTable = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  address: text("address").notNull().unique(),
  balanceNexa: numeric("balance_nexa", { precision: 30, scale: 8 }).notNull().default("0"),
  balanceUsd: numeric("balance_usd", { precision: 20, scale: 4 }).notNull().default("0"),
  kycStatus: kycStatusEnum("kyc_status").notNull().default("approved"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWalletSchema = createInsertSchema(walletsTable).omit({ id: true, createdAt: true });
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof walletsTable.$inferSelect;
