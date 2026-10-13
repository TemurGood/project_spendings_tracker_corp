import { db } from "@/db";
import { stores, users } from "@/db/schema";
import { createStore } from "@/app/actions/admin";
import { Store as StoreIcon, Plus, UserCheck } from "lucide-react";

export default async function StoresManagementPage() {
  const storeList = await db.select().from(stores);
  const managerList = await db.select().from(users);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Управление филиалами сети</h1>
        <p className="text-sm text-slate-400 mt-1">
          Добавление новых торговых точек и контроль закрепленных управляющих
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Форма добавления магазина */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-fit">
          <div className="flex items-center space-x-2 mb-4">
            <Plus className="w-5 h-5 text-blue-400" />
            <h2 className="font-semibold text-white">Добавить филиал</h2>
          </div>

          <form action={createStore} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
                Название магазина
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Например: ТРЦ Галерея"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
                Код филиала
              </label>
              <input
                type="text"
                name="code"
                required
                placeholder="STR-003"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
                Город
              </label>
              <input
                type="text"
                name="city"
                required
                placeholder="Казань"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Создать филиал
            </button>
          </form>
        </div>

        {/* Список действующих магазинов */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StoreIcon className="w-5 h-5 text-emerald-400" />
              <h2 className="font-semibold text-white">
                Действующие филиалы ({storeList.length})
              </h2>
            </div>
          </div>

          <div className="divide-y divide-slate-800">
            {storeList.map((store) => {
              const manager = managerList.find((u) => u.storeId === store.id);
              return (
                <div
                  key={store.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition"
                >
                  <div>
                    <h3 className="font-semibold text-white">{store.name}</h3>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
                      <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                        {store.code}
                      </span>
                      <span>{store.city}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {manager ? (
                      <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{manager.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">
                        Менеджер не назначен
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}