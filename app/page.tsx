"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, ShieldAlert, ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              CorpSpend Tracker
            </h1>
            <p className="text-xs text-slate-400">Корпоративный портал сети</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/80 border border-red-500/50 rounded-xl flex items-center space-x-3 text-red-300 text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Рабочий Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@corp.com"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 text-sm cursor-pointer"
          >
            <span>{loading ? "Авторизация..." : "Войти в систему"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Быстрые ссылки для тестирования */}
        <div className="mt-8 pt-6 border-t border-slate-700/60">
          <p className="text-xs text-slate-400 font-medium mb-3 text-center">
            Быстрый вход для тестирования:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@corp.com")}
              className="p-2 bg-slate-700/60 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 text-center transition"
            >
              👑 HQ Админ
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("manager1@corp.com")}
              className="p-2 bg-slate-700/60 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 text-center transition"
            >
              🏬 Магазин 1 (Центр)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}