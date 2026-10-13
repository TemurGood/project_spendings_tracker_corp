"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { stores, budgetAllocations } from "@/db/schema";
import { revalidatePath } from "next/cache";

// Проверка прав администратора
async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "HQ_ADMIN") {
    throw new Error("Доступ запрещен: требуются права HQ_ADMIN");
  }
  return session.user;
}

// 1. Создание нового магазина
export async function createStore(formData: FormData): Promise<void> {
  await ensureAdmin();

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const city = formData.get("city") as string;

  if (!name || !code || !city) {
    throw new Error("Заполните все поля");
  }

  const id = `str-${Date.now()}`;

  await db.insert(stores).values({
    id,
    name,
    code: code.toUpperCase().trim(),
    city,
  });

  revalidatePath("/admin/stores");
  revalidatePath("/admin/dashboard");
}

// 2. Назначение бюджета филиалу
export async function allocateBudget(formData: FormData): Promise<void> {
  await ensureAdmin();

  const storeId = formData.get("storeId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const month = (formData.get("month") as string) || new Date().toISOString().slice(0, 7);
  const notes = (formData.get("notes") as string) || "";

  if (!storeId || isNaN(amount)) {
    throw new Error("Некорректные данные бюджета");
  }

  await db.insert(budgetAllocations).values({
    id: `bgt-${Date.now()}`,
    storeId,
    month,
    allocatedBudget: amount,
    notes,
  });

  revalidatePath("/admin/dashboard");
}