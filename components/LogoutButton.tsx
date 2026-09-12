"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-neutral-600 hover:bg-neutral-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      Logout
    </button>
  );
}
