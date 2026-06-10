import { pgTable, text, uuid, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { walletsTable } from "./wallet";

export const merchantsTable = pgTable("merchants", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id),
  walletId: uuid("wallet_id").references(() => walletsTable.id),
  businessName: text("business_name").notNull(),
  settlementAddress: text("settlement_address").notNull(),
  category: text("category").notNull().default("Services"),
  totalVolume: numeric("total_volume", { precision: 30, scale: 8 }).notNull().default("0"),
  transactionCount: integer("transaction_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMerchantSchema = createInsertSchema(merchantsTable).omit({ id: true, createdAt: true, totalVolume: true, transactionCount: true });
export type InsertMerchant = z.infer<typeof insertMerchantSchema>;
export type Merchant = typeof merchantsTable.$inferSelect;
