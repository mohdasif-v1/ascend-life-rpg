"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!res || res.error) {
        setError("Incorrect email or password. Please check your credentials.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to the authentication server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-obsidian-800 bg-obsidian-900/85 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="inline-flex flex-col items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane rounded-xl p-1"
        >
          <div className="flex items-center justify-center transition group-hover:scale-105">
            <Logo size={44} variant="accent" />
          </div>
          <span className="font-display font-black text-2xl tracking-wider text-white">
            ASCEND
          </span>
        </Link>
        <p className="mt-2 text-xs text-neutral-400">
          Enter your email and password to access your character
        </p>
      </div>

      {registered && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300"
        >
          Account created successfully. Your starter quest is seeded. Please log in below.
        </div>
      )}

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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="mt-1.5 w-full rounded-xl border border-obsidian-750 bg-obsidian-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 transition focus:border-arcane focus:outline-none focus-visible:ring-1 focus-visible:ring-arcane"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-arcane hover:bg-arcane-dark py-2.5 px-4 text-xs font-display font-bold tracking-wider text-white shadow-arcane transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane-light active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" aria-hidden="true" />
              <span>LOGGING IN...</span>
            </>
          ) : (
            <span>LOG IN</span>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-neutral-400">
        New character?{" "}
        <Link
          href="/signup"
          className="font-medium text-arcane-light hover:text-white underline underline-offset-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-arcane rounded"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-obsidian-950 px-6 text-neutral-100 bg-arcane-radial bg-rpg-grid">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[550px] -translate-x-1/2 rounded-full bg-arcane/10 blur-3xl"
      />
      <Suspense fallback={<div className="text-neutral-400 text-sm">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
