import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { revenues, expenses, budgetAllocations, stores } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { addRevenue, addExpense } from "@/app/actions/store";
import { TrendingUp, TrendingDown, Wallet, PlusCircle } from "lucide-react";

export default async function StoreDashboardPage() {
  const session = (await getServerSession(authOptions))!;
  const storeId = session.user.storeId!;

  // Получаем только данные текущего магазина
  const storeRevs = await db
    .select()
    .from(revenues)
    .where(eq(revenues.storeId, storeId))
    .orderBy(desc(revenues.date));

  const storeExps = await db
    .select()
    .from(expenses)
    .where(eq(expenses.storeId, storeId))
    .orderBy(desc(expenses.date));

  const storeBudgets = await db
    .select()
    .from(budgetAllocations)
    .where(eq(budgetAllocations.storeId, storeId));

  const totalRev = storeRevs.reduce((a, b) => a + b.amount, 0);
  const totalExp = storeExps.reduce((a, b) => a + b.amount, 0);
  const allocatedBudget = storeBudgets.reduce((a, b) => a + b.allocatedBudget, 0);
  const budgetRemaining = allocatedBudget - totalExp;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Панель управления филиалом</h1>
        <p className="text-sm text-slate-400 mt-1">
          Внесение кассовых сборов и учет операционных расходов филиала
        </p>
      </div>

      {/* Финансовые карточки филиала */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Выручка филиала</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {totalRev.toLocaleString("ru-RU")} ₽
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Расходы филиала</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">
            {totalExp.toLocaleString("ru-RU")} ₽
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Выделенный бюджет</span>
            <Wallet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {allocatedBudget > 0 ? `${allocatedBudget.toLocaleString("ru-RU")} ₽` : "Не назначен"}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Остаток бюджета</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                budgetRemaining >= 0
                  ? "bg-emerald-950 text-emerald-400"
                  : "bg-rose-950 text-rose-400"
              }`}
            >
              {allocatedBudget > 0 ? `${((budgetRemaining / allocatedBudget) * 100).toFixed(0)}%` : "0%"}
            </span>
          </div>
          <div
            className={`text-2xl font-bold ${
              budgetRemaining >= 0 ? "text-white" : "text-rose-400"
            }`}
          >
            {budgetRemaining.toLocaleString("ru-RU")} ₽
          </div>
        </div>
      </div>

      {/* Формы добавления операций */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Форма Дохода */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center space-x-2">
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Внести выручку</span>
          </h2>
          <form action={addRevenue} className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-slate-400 mb-1">Сумма (₽)</label>
              <input
                type="number"
                step="any"
                name="amount"
                required
                placeholder="50000"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase text-slate-400 mb-1">Категория</label>
                <input
                  type="text"
                  name="category"
                  defaultValue="Розничные продажи"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-400 mb-1">Дата</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase text-slate-400 mb-1">Примечание</label>
              <input
                type="text"
                name="description"
                placeholder="Смена #1, касса 2"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Зафиксировать выручку
            </button>
          </form>
        </div>

        {/* Форма Расхода */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center space-x-2">
            <PlusCircle className="w-4 h-4 text-rose-400" />
            <span>Внести расход филиала</span>
          </h2>
          <form action={addExpense} className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-slate-400 mb-1">Сумма (₽)</label>
              <input
                type="number"
                step="any"
                name="amount"
                required
                placeholder="12000"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase text-slate-400 mb-1">Категория</label>
                <input
                  type="text"
                  name="category"
                  defaultValue="Логистика и хознужды"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-400 mb-1">Дата</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase text-slate-400 mb-1">Примечание</label>
              <input
                type="text"
                name="description"
                placeholder="Закупка упаковки"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Зафиксировать расход
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}