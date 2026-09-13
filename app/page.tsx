import Link from "next/link";
import { Compass, Shield, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ASCEND — Turn Real Life Into an RPG",
  description: "Transform daily habits, real-world productivity, and discipline into a dark-fantasy RPG progression system.",
};

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-obsidian-950 px-6 text-center bg-arcane-radial bg-rpg-grid">
      {/* Subtle atmospheric ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[450px] w-[650px] -translate-x-1/2 rounded-full bg-arcane/15 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
        {/* Title */}
        <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl tracking-widest text-white drop-shadow-sm">
          ASCEND
        </h1>

        {/* Tagline */}
        <p className="mt-5 text-lg font-normal tracking-wide text-neutral-300 sm:text-xl md:text-2xl max-w-lg">
          Turn your real life into an RPG.
        </p>

        {/* Feature pillars */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-left w-full max-w-lg">
          <div className="rounded-2xl border border-obsidian-800 bg-obsidian-900/70 p-4 backdrop-blur-md">
            <Compass className="h-4 w-4 text-arcane-light mb-2" aria-hidden="true" />
            <h2 className="font-display font-bold text-xs text-white tracking-wide">QUESTS</h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">Real-world tasks transformed into objectives</p>
          </div>
          <div className="rounded-2xl border border-obsidian-800 bg-obsidian-900/70 p-4 backdrop-blur-md">
            <Zap className="h-4 w-4 text-relic-gold mb-2" aria-hidden="true" />
            <h2 className="font-display font-bold text-xs text-white tracking-wide">LEVEL UP</h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">Non-linear exponential ascension formula</p>
          </div>
          <div className="rounded-2xl border border-obsidian-800 bg-obsidian-900/70 p-4 backdrop-blur-md">
            <Shield className="h-4 w-4 text-emerald-400 mb-2" aria-hidden="true" />
            <h2 className="font-display font-bold text-xs text-white tracking-wide">ARMORY</h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">Treasury gold and permanent stat relics</p>
          </div>
        </div>

        {/* Live HUD Teaser Preview */}
        <div className="mt-8 w-full max-w-lg rounded-2xl border border-obsidian-800 bg-obsidian-900/80 p-5 text-left backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-arcane animate-pulse" />
              <span className="font-display font-bold text-xs text-neutral-300 tracking-wider">
                STARTER OBJECTIVE
              </span>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              +50 XP • LEVEL 2 THRESHOLD
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="font-display font-bold text-sm text-white">
                Complete your first coding quest
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                New characters start at 240 XP. Completing this unlocks Level 2 immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Auth CTA navigation */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto rounded-xl bg-arcane hover:bg-arcane-dark px-7 py-3 text-xs font-display font-bold tracking-wider text-white shadow-arcane transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane-light active:scale-[0.98]"
          >
            BEGIN ASCENSION
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto rounded-xl border border-obsidian-750 bg-obsidian-900 px-7 py-3 text-xs font-display font-bold tracking-wider text-neutral-200 transition hover:border-obsidian-600 hover:bg-obsidian-850 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane active:scale-[0.98]"
          >
            SIGN IN
          </Link>
        </div>
      </div>
    </main>
  );
}
