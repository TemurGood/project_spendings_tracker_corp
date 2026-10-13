"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-red-950/40 rounded-lg transition"
    >
      <LogOut className="w-4 h-4" />
      <span>Выйти</span>
    </button>
  );
}