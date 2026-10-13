import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Store, Trophy, LayoutDashboard } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "HQ_ADMIN") {
    redirect("/admin/dashboard");
  }

  const [currentStore] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, session.user.storeId || ""))
    .limit(1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Боковая панель магазина */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white truncate max-w-[140px]">
                {currentStore?.name || "Мой филиал"}
              </h2>
              <span className="text-xs text-emerald-400 font-mono">
                {currentStore?.code} • {currentStore?.city}
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <Link
              href="/store/dashboard"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Финансы филиала</span>
            </Link>
            <Link
              href="/store/competition"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Лидерборд сети</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <div className="mb-3 px-2">
            <p className="text-xs text-slate-400">Управляющий:</p>
            <p className="text-sm font-semibold text-white truncate">
              {session.user.name}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-300 rounded font-mono">
              STORE_MANAGER
            </span>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}