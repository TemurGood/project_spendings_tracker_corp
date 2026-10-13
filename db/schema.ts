import { sql } from "drizzle-orm";
import { text, integer, real, sqliteTable } from "drizzle-orm/sqlite-core";

// 1. Stores (Магазины сети)
export const stores = sqliteTable("stores", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // e.g., "STR-001"
  city: text("city").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 2. Users (Пользователи: HQ_ADMIN или STORE_MANAGER)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Хешированный bcrypt
  role: text("role", { enum: ["HQ_ADMIN", "STORE_MANAGER"] }).notNull(),
  storeId: text("store_id").references(() => stores.id), // Nullable для HQ_ADMIN
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 3. Revenues (Выручка - видна всем для бенчмаркинга)
export const revenues = sqliteTable("revenues", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull().references(() => stores.id),
  amount: real("amount").notNull(),
  category: text("category").notNull(), // e.g., "Retail Sales", "Online Pickup"
  date: text("date").notNull(), // ISO YYYY-MM-DD
  description: text("description"),
  createdById: text("created_by_id").notNull().references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 4. Expenses (Расходы - СТРОГО изолированы для магазинов)
export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull().references(() => stores.id),
  amount: real("amount").notNull(),
  category: text("category").notNull(), // e.g., "Logistics", "Utilities", "Salaries"
  date: text("date").notNull(), // ISO YYYY-MM-DD
  description: text("description"),
  createdById: text("created_by_id").notNull().references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 5. Budget Allocations (Бюджетные лимиты от штаб-квартиры)
export const budgetAllocations = sqliteTable("budget_allocations", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull().references(() => stores.id),
  month: text("month").notNull(), // YYYY-MM
  allocatedBudget: real("allocated_budget").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});