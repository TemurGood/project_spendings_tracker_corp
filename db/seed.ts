import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client, { schema });

async function seed() {
  console.log("⏳ Запуск сидирования базы данных...");

  // Очистка перед сидом
  await db.delete(schema.budgetAllocations);
  await db.delete(schema.expenses);
  await db.delete(schema.revenues);
  await db.delete(schema.users);
  await db.delete(schema.stores);

  const defaultPassword = await bcrypt.hash("password123", 10);

  // 1. Создание магазинов
  const storeA = {
    id: "str-001",
    name: "Флагманский магазин Центр",
    code: "STR-001",
    city: "Москва",
  };
  const storeB = {
    id: "str-002",
    name: "Магазин Северный",
    code: "STR-002",
    city: "Санкт-Петербург",
  };

  await db.insert(schema.stores).values([storeA, storeB]);

  // 2. Создание пользователей
  await db.insert(schema.users).values([
    {
      id: "usr-admin",
      name: "Главный Администратор HQ",
      email: "admin@corp.com",
      password: defaultPassword,
      role: "HQ_ADMIN",
      storeId: null,
    },
    {
      id: "usr-mgr-1",
      name: "Иван Менеджер (Центр)",
      email: "manager1@corp.com",
      password: defaultPassword,
      role: "STORE_MANAGER",
      storeId: storeA.id,
    },
    {
      id: "usr-mgr-2",
      name: "Ольга Менеджер (Северный)",
      email: "manager2@corp.com",
      password: defaultPassword,
      role: "STORE_MANAGER",
      storeId: storeB.id,
    },
  ]);

  // 3. Тестовые доходы и расходы
  await db.insert(schema.revenues).values([
    {
      id: "rev-1",
      storeId: storeA.id,
      amount: 450000,
      category: "Розничные продажи",
      date: new Date().toISOString().split("T")[0],
      createdById: "usr-mgr-1",
    },
    {
      id: "rev-2",
      storeId: storeB.id,
      amount: 320000,
      category: "Розничные продажи",
      date: new Date().toISOString().split("T")[0],
      createdById: "usr-mgr-2",
    },
  ]);

  await db.insert(schema.expenses).values([
    {
      id: "exp-1",
      storeId: storeA.id,
      amount: 120000,
      category: "Аренда и коммунальные услуги",
      date: new Date().toISOString().split("T")[0],
      createdById: "usr-mgr-1",
    },
    {
      id: "exp-2",
      storeId: storeB.id,
      amount: 95000,
      category: "Логистика",
      date: new Date().toISOString().split("T")[0],
      createdById: "usr-mgr-2",
    },
  ]);

  console.log("✅ База данных успешно заполнена тестовыми данными!");
  console.log("Логины: admin@corp.com, manager1@corp.com, manager2@corp.com");
  console.log("Пароль для всех: password123");
}

seed().catch((e) => {
  console.error("Ошибка при сидировании:", e);
  process.exit(1);
});