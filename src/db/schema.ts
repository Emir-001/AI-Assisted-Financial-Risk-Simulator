import { pgTable, text, timestamp, uuid, integer, decimal, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const financialProfiles = pgTable("financial_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  monthlyIncome: decimal("monthly_income", { precision: 12, scale: 2 }).notNull().default("0"),
  monthlyExpenses: decimal("monthly_expenses", { precision: 12, scale: 2 }).notNull().default("0"),
  totalSavings: decimal("total_savings", { precision: 12, scale: 2 }).notNull().default("0"),
  totalDebt: decimal("total_debt", { precision: 12, scale: 2 }).notNull().default("0"),
  monthlyDebtPayment: decimal("monthly_debt_payment", { precision: 12, scale: 2 }).notNull().default("0"),
  currency: text("currency").notNull().default("TRY"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scenarios = pgTable("scenarios", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  config: jsonb("config").notNull(), // e.g., { type: 'credit', amount: 400000, interest: 2.5 }
  result: jsonb("result").notNull(), // AI generated simulation results
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insights = pgTable("insights", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'risk', 'behavioral', 'recommendation'
  content: text("content").notNull(),
  score: integer("score"), // 0-100
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
