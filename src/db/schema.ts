import { pgTable, text, timestamp, numeric, integer, boolean, doublePrecision } from "drizzle-orm/pg-core";

export const categoriesTable = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'income' | 'expense'
  iconName: text("icon_name").notNull(),
  color: text("color"),
  isCustom: boolean("is_custom").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const movementsTable = pgTable("movements", {
  id: text("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  type: text("type").notNull(), // 'income' | 'expense'
  amount: doublePrecision("amount").notNull(),
  categoryId: text("category_id").notNull(),
  description: text("description").notNull(),
  paymentMethod: text("payment_method").notNull(), // 'cash' | 'card' | 'transfer' | 'other'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  fixedPaymentId: text("fixed_payment_id"),
});

export const fixedPaymentsTable = pgTable("fixed_payments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  amount: doublePrecision("amount").notNull(),
  dueDay: integer("due_day").notNull(),
  categoryId: text("category_id").notNull(),
  notes: text("notes"),
  reminderActive: boolean("reminder_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fixedPaymentRecordsTable = pgTable("fixed_payment_records", {
  id: text("id").primaryKey(), // `${year}-${month}-${fixedPaymentId}`
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 0-indexed
  fixedPaymentId: text("fixed_payment_id").notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  paidDate: text("paid_date"),
  movementId: text("movement_id"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const budgetLimitsTable = pgTable("budget_limits", {
  categoryId: text("category_id").primaryKey(),
  monthlyLimit: doublePrecision("monthly_limit").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
