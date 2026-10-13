import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { stores, revenues } from "@/db/schema";
import { Trophy, Medal } from "lucide-react";

export default async function StoreCompetitionPage() {
  const session = (await getServerSession(authOptions))!;
  const currentStoreId = session.user.storeId;

  // Безопасность: запрашиваем ТОЛЬКО магазины и выручку.
  // Таблица expenses здесь ВООБЩЕ не участвует в выборке!
  const allStores = await db.select().from(stores);
  const allRevenues = await db.select().from(revenues);

  // Считаем сумму выручки по каждому филиалу и сортируем по убыванию
  const leaderboard = allStores
    .map((store) => {
      const storeTotalRev = allRevenues
        .filter((r) => r.storeId === store.id)
        .reduce((sum, r) => sum + r.amount, 0);

      return {
        id: store.id,
        name: store.name,
        code: store.code,
        city: store.city,
        totalRevenue: storeTotalRev,
        isCurrentStore: store.id === currentStoreId,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center space-x-3">
          <Trophy className="w-7 h-7 text-amber-400" />
          <h1 className="text-2xl font-bold text-white">Рейтинг филиалов сети</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Общая выручка филиалов сети. Расходы и операционные показатели каждого магазина остаются строго конфиденциальными.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 text-center w-16">Место</th>
              <th className="py-3.5 px-4">Филиал</th>
              <th className="py-3.5 px-4">Город</th>
              <th className="py-3.5 px-4 text-right">Выручка (публично)</th>
              <th className="py-3.5 px-4 text-center">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {leaderboard.map((item, index) => {
              const rank = index + 1;
              return (
                <tr
                  key={item.id}
                  className={`transition ${
                    item.isCurrentStore
                      ? "bg-blue-950/30 border-l-4 border-l-blue-500 font-semibold"
                      : "hover:bg-slate-800/40"
                  }`}
                >
                  <td className="py-4 px-4 text-center">
                    {rank === 1 && <span className="text-xl">🥇</span>}
                    {rank === 2 && <span className="text-xl">🥈</span>}
                    {rank === 3 && <span className="text-xl">🥉</span>}
                    {rank > 3 && (
                      <span className="font-mono text-slate-500 text-sm">#{rank}</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-white flex items-center space-x-2">
                      <span>{item.name}</span>
                      {item.isCurrentStore && (
                        <span className="text-[10px] bg-blue-600/40 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                          Ваш магазин
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{item.code}</span>
                  </td>
                  <td className="py-4 px-4 text-slate-400">{item.city}</td>
                  <td className="py-4 px-4 text-right font-mono text-emerald-400 text-base">
                    {item.totalRevenue.toLocaleString("ru-RU")} ₽
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      🔒 Расходы скрыты
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}