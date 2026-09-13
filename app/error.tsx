"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Compass } from "lucide-react";
import Logo from "@/components/Logo";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected errors securely without sensitive leakage
    console.error("[ASCEND_RUNTIME_EXCEPTION]:", error.message, error.digest);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-obsidian-950 px-6 text-center bg-arcane-radial bg-rpg-grid">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[550px] -translate-x-1/2 rounded-full bg-rose-500/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-sm mb-6">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>

        <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-400 mb-2">
          ETHER TURBULENCE • ANOMALY DETECTED
        </span>

        <h1 className="font-display font-black text-3xl sm:text-4xl tracking-wide text-white">
          ASTRAL DISTORTION
        </h1>

        <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-sm">
          An unexpected mystic disturbance interrupted this operation. Your heroic progression remains intact.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-arcane hover:bg-arcane-dark py-3 px-5 text-xs font-display font-bold tracking-wider text-white shadow-arcane transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane-light active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>RE-ATTEMPT TRIAL</span>
          </button>
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-obsidian-750 bg-obsidian-900/80 hover:bg-obsidian-850 py-3 px-5 text-xs font-display font-bold tracking-wider text-neutral-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane active:scale-[0.98]"
          >
            <Compass className="h-4 w-4" aria-hidden="true" />
            <span>RETURN TO NEXUS</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
