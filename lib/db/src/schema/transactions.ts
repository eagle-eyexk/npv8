import { pgTable, text, uuid, numeric, timestamp, pgEnum, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { walletsTable } from "./wallet";

export const txTypeEnum = pgEnum("tx_type", ["send", "receive", "tap_pay", "card_spend", "mining"]);
export const txStatusEnum = pgEnum("tx_status", ["pending", "confirmed", "failed"]);

export const transactionsTable = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id").references(() => walletsTable.id),
  type: txTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 30, scale: 8 }).notNull(),
  amountUsd: numeric("amount_usd", { precision: 20, scale: 4 }).notNull().default("0"),
  fromAddress: text("from_address"),
  toAddress: text("to_address"),
  merchantName: text("merchant_name"),
  status: txStatusEnum("status").notNull().default("confirmed"),
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("idx_tx_created").on(t.createdAt),
  index("idx_tx_type").on(t.type),
  index("idx_tx_wallet").on(t.walletId),
]);

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
