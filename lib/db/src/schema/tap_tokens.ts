import { pgTable, text, uuid, numeric, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { walletsTable } from "./wallet";
import { merchantsTable } from "./merchants";

export const tapTokenStatusEnum = pgEnum("tap_token_status", ["pending", "claimed", "expired"]);

export const tapTokensTable = pgTable("tap_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(),
  walletId: uuid("wallet_id").references(() => walletsTable.id).notNull(),
  merchantId: uuid("merchant_id").references(() => merchantsTable.id).notNull(),
  amount: numeric("amount", { precision: 30, scale: 8 }).notNull(),
  nonce: integer("nonce").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  claimedAt: timestamp("claimed_at"),
  status: tapTokenStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTapTokenSchema = createInsertSchema(tapTokensTable).omit({ id: true, createdAt: true });
export type InsertTapToken = z.infer<typeof insertTapTokenSchema>;
export type TapToken = typeof tapTokensTable.$inferSelect;
