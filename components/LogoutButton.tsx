"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      aria-label="Sign out of ASCEND"
      className="inline-flex items-center gap-1.5 rounded-lg border border-obsidian-800 bg-obsidian-900 px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:border-obsidian-700 hover:text-white hover:bg-obsidian-850 focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane"
    >
      <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}
