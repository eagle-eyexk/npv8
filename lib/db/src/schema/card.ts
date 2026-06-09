import { pgTable, text, uuid, numeric, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cardStatusEnum = pgEnum("card_status", ["active", "frozen", "pending"]);
export const cardSpendStatusEnum = pgEnum("card_spend_status", ["pending", "cleared", "declined"]);

export const cardsTable = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  last4: text("last4").notNull(),
  network: text("network").notNull().default("Visa"),
  status: cardStatusEnum("status").notNull().default("active"),
  spendLimitUsd: numeric("spend_limit_usd", { precision: 20, scale: 4 }).notNull().default("10000"),
  availableUsd: numeric("available_usd", { precision: 20, scale: 4 }).notNull().default("8432.50"),
  expiryMonth: integer("expiry_month").notNull().default(12),
  expiryYear: integer("expiry_year").notNull().default(2027),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cardSpendTable = pgTable("card_spend", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantName: text("merchant_name").notNull(),
  amountUsd: numeric("amount_usd", { precision: 20, scale: 4 }).notNull(),
  category: text("category").notNull(),
  status: cardSpendStatusEnum("status").notNull().default("cleared"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCardSpendSchema = createInsertSchema(cardSpendTable).omit({ id: true, createdAt: true });
export type InsertCardSpend = z.infer<typeof insertCardSpendSchema>;
export type Card = typeof cardsTable.$inferSelect;
export type CardSpend = typeof cardSpendTable.$inferSelect;
