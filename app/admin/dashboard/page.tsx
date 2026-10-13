import { db } from "@/db";
import { stores, revenues, expenses, budgetAllocations } from "@/db/schema";
import { TrendingUp, TrendingDown, DollarSign, Percent, Plus } from "lucide-react";
import { allocateBudget } from "@/app/actions/admin";

export default async function AdminDashboardPage() {
  const allStores = await db.select().from(stores);
  const allRevenues = await db.select().from(revenues);
  const allExpenses = await db.select().from(expenses);
  const allBudgets = await db.select().from(budgetAllocations);

  // Консолидированные вычисления
  const totalRevenue = allRevenues.reduce((acc, r) => acc + r.amount, 0);
  const totalExpense = allExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpense;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0";

  // Статистика в разрезе филиалов
  const storePerformance = allStores.map((store) => {
    const rev = allRevenues
      .filter((r) => r.storeId === store.id)
      .reduce((a, b) => a + b.amount, 0);
    const exp = allExpenses
      .filter((e) => e.storeId === store.id)
      .reduce((a, b) => a + b.amount, 0);
    const profit = rev - exp;
    const margin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : "0";
    const currentBudget = allBudgets
      .filter((b) => b.storeId === store.id)
      .reduce((a, b) => a + b.allocatedBudget, 0);

    return {
      ...store,
      revenue: rev,
      expense: exp,
      profit,
      margin,
      budget: currentBudget,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Аналитика сети розницы</h1>
        <p className="text-sm text-slate-400 mt-1">
          Консолидированные финансовые показатели по всем филиалам
        </p>
      </div>

      {/* KPI карточки */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Выручка сети</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {totalRevenue.toLocaleString("ru-RU")} ₽
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Расходы сети</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">
            {totalExpense.toLocaleString("ru-RU")} ₽
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Чистая прибыль</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {netProfit.toLocaleString("ru-RU")} ₽
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Маржинальность</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{profitMargin}%</div>
        </div>
      </div>

      {/* Таблица производительности филиалов и распределения бюджетов */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-white">
              Показатели филиалов и распределение бюджетов
            </h2>
            <p className="text-xs text-slate-400">
              Выделяйте бюджет филиалам на основе их маржинальности
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Код / Магазин</th>
                <th className="py-3 px-4">Город</th>
                <th className="py-3 px-4 text-right">Выручка</th>
                <th className="py-3 px-4 text-right">Расходы</th>
                <th className="py-3 px-4 text-right">Прибыль</th>
                <th className="py-3 px-4 text-right">Маржа</th>
                <th className="py-3 px-4 text-right">Текущий бюджет</th>
                <th className="py-3 px-4 text-center">Выделить бюджет</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {storePerformance.map((store) => (
                <tr key={store.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{store.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{store.code}</div>
                  </td>
                  <td className="py-3.5 px-4">{store.city}</td>
                  <td className="py-3.5 px-4 text-right font-medium text-emerald-400">
                    {store.revenue.toLocaleString("ru-RU")} ₽
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-rose-400">
                    {store.expense.toLocaleString("ru-RU")} ₽
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-white">
                    {store.profit.toLocaleString("ru-RU")} ₽
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-800 border border-slate-700 font-mono">
                      {store.margin}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-blue-300">
                    {store.budget > 0 ? `${store.budget.toLocaleString("ru-RU")} ₽` : "—"}
                  </td>
                  <td className="py-3.5 px-4">
                    <form action={allocateBudget} className="flex items-center justify-center space-x-2">
                      <input type="hidden" name="storeId" value={store.id} />
                      <input
                        type="number"
                        name="amount"
                        required
                        placeholder="Сумма ₽"
                        className="w-28 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs flex items-center space-x-1 cursor-pointer transition"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Назначить</span>
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}