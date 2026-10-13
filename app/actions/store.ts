"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { revenues, expenses } from "@/db/schema";
import { revalidatePath } from "next/cache";

async function getStoreManagerSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.storeId) {
    throw new Error("Неавторизованный доступ: филиал не привязан");
  }
  return session.user;
}

// Добавление выручки
export async function addRevenue(formData: FormData) {
  const user = await getStoreManagerSession();

  const amount = parseFloat(formData.get("amount") as string);
  const category = (formData.get("category") as string) || "Розничные продажи";
  const description = (formData.get("description") as string) || "";
  const date =
    (formData.get("date") as string) || new Date().toISOString().split("T")[0];

  if (isNaN(amount) || amount <= 0) {
    throw new Error("Укажите корректную сумму");
  }

  await db.insert(revenues).values({
    id: `rev-${Date.now()}`,
    storeId: user.storeId!,
    amount,
    category,
    description,
    date,
    createdById: user.id,
  });

  revalidatePath("/store/dashboard");
  revalidatePath("/store/competition");
  return { success: true };
}

// Добавление расхода (Строго для своего магазина)
export async function addExpense(formData: FormData) {
  const user = await getStoreManagerSession();

  const amount = parseFloat(formData.get("amount") as string);
  const category = (formData.get("category") as string) || "Прочие расходы";
  const description = (formData.get("description") as string) || "";
  const date =
    (formData.get("date") as string) || new Date().toISOString().split("T")[0];

  if (isNaN(amount) || amount <= 0) {
    throw new Error("Укажите корректную сумму");
  }

  await db.insert(expenses).values({
    id: `exp-${Date.now()}`,
    storeId: user.storeId!,
    amount,
    category,
    description,
    date,
    createdById: user.id,
  });

  revalidatePath("/store/dashboard");
  return { success: true };
}