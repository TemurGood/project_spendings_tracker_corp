import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Store, Building } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "HQ_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Боковая панель */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide text-white">
                HQ PORTAL
              </h2>
              <span className="text-xs text-blue-400 font-medium">Штаб-квартира</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>Аналитика сети</span>
            </Link>
            <Link
              href="/admin/stores"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Управление филиалами</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <div className="mb-3 px-2">
            <p className="text-xs text-slate-400">Вы вошли как:</p>
            <p className="text-sm font-semibold text-white truncate">
              {session.user.name}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-blue-950 border border-blue-500/40 text-blue-300 rounded font-mono">
              HQ_ADMIN
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