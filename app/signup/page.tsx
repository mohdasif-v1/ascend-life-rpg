"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unable to complete registration. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-obsidian-950 px-6 text-neutral-100 bg-arcane-radial bg-rpg-grid">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[550px] -translate-x-1/2 rounded-full bg-arcane/10 blur-3xl"
      />
      <div className="w-full max-w-md rounded-2xl border border-obsidian-800 bg-obsidian-900/85 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex flex-col items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane rounded-xl p-1"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-obsidian-750 bg-obsidian-850 font-display font-black text-lg text-arcane-light shadow-sm transition group-hover:border-arcane/50 group-hover:shadow-arcane">
              A
            </div>
            <span className="font-display font-black text-2xl tracking-wider text-white">
              ASCEND
            </span>
          </Link>
          <p className="mt-2 text-xs text-neutral-400">
            Create an account to start turning daily tasks into character progression
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300"
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
              Email address
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
              className="mt-1.5 w-full rounded-xl border border-obsidian-750 bg-obsidian-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 transition focus:border-arcane focus:outline-none focus-visible:ring-1 focus-visible:ring-arcane"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-neutral-400"
              >
                Password
              </label>
              <span className="text-[11px] text-neutral-500">Minimum 6 characters</span>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="mt-1.5 w-full rounded-xl border border-obsidian-750 bg-obsidian-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 transition focus:border-arcane focus:outline-none focus-visible:ring-1 focus-visible:ring-arcane"
            />
          </div>

          <div className="rounded-xl border border-obsidian-800 bg-obsidian-950/60 p-3 text-[11px] text-neutral-400">
            <span className="font-semibold text-neutral-300">Starter Bonus:</span> New accounts receive a seeded coding quest and 240 XP, placing you right at the threshold of Level 2.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-arcane hover:bg-arcane-dark py-2.5 px-4 text-xs font-display font-bold tracking-wider text-white shadow-arcane transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane-light active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" aria-hidden="true" />
                <span>CREATING ACCOUNT...</span>
              </>
            ) : (
              <span>CREATE ACCOUNT</span>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-arcane-light hover:text-white underline underline-offset-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-arcane rounded"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
