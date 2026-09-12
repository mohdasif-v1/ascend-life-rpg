"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-obsidian-950 px-6 text-neutral-100 bg-arcane-radial bg-rpg-grid">
      <div className="w-full max-w-md rounded-2xl border border-obsidian-800 bg-obsidian-900/80 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-obsidian-700 bg-obsidian-850 font-display font-black text-arcane-light">
            A
          </div>
          <h1 className="font-display font-black text-2xl tracking-wider text-white">
            BEGIN ASCENSION
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Create an account to forge your character
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-400"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="player@ascend.game"
              className="mt-1.5 w-full rounded-lg border border-obsidian-800 bg-obsidian-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 transition focus:border-arcane focus:outline-none focus-visible:ring-1 focus-visible:ring-arcane"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-400"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="mt-1.5 w-full rounded-lg border border-obsidian-800 bg-obsidian-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 transition focus:border-arcane focus:outline-none focus-visible:ring-1 focus-visible:ring-arcane"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-arcane hover:bg-arcane-dark py-2.5 px-4 text-xs font-display font-bold tracking-wider text-white shadow-arcane transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane-light active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "FORGING ACCOUNT..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-400">
          Already forged?{" "}
          <Link
            href="/login"
            className="font-medium text-arcane-light hover:text-white underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
