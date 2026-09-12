import Link from "next/link";
import { Compass, Shield, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-obsidian-950 px-6 text-center bg-arcane-radial bg-rpg-grid">
      {/* Subtle atmospheric ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[450px] w-[650px] -translate-x-1/2 rounded-full bg-arcane/15 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-arcane/30 bg-arcane/10 px-4 py-1 text-xs font-semibold tracking-wider text-arcane-light backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-display font-bold">SYSTEM ONLINE</span>
        </div>

        {/* Title */}
        <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl tracking-widest text-white drop-shadow-sm">
          ASCEND
        </h1>

        {/* Tagline */}
        <p className="mt-5 text-lg font-normal tracking-wide text-neutral-300 sm:text-xl md:text-2xl max-w-lg">
          Turn your real life into an RPG.
        </p>

        {/* Feature pillars */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-left w-full max-w-md">
          <div className="rounded-xl border border-obsidian-800 bg-obsidian-900/60 p-3">
            <Compass className="h-4 w-4 text-arcane-light mb-1.5" aria-hidden="true" />
            <h2 className="font-display font-bold text-xs text-white">QUESTS</h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">Real-life tasks</p>
          </div>
          <div className="rounded-xl border border-obsidian-800 bg-obsidian-900/60 p-3">
            <Zap className="h-4 w-4 text-relic-gold mb-1.5" aria-hidden="true" />
            <h2 className="font-display font-bold text-xs text-white">PROGRESS</h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">XP & Leveling</p>
          </div>
          <div className="rounded-xl border border-obsidian-800 bg-obsidian-900/60 p-3">
            <Shield className="h-4 w-4 text-emerald-400 mb-1.5" aria-hidden="true" />
            <h2 className="font-display font-bold text-xs text-white">ARMORY</h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">Artifact spoils</p>
          </div>
        </div>

        {/* Auth CTA navigation */}
        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/login"
            className="rounded-xl bg-arcane hover:bg-arcane-dark px-6 py-3 text-sm font-display font-bold tracking-wider text-white shadow-arcane transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane-light active:scale-[0.98]"
          >
            SIGN IN
          </Link>
          <Link
            href="/signup"
            className="rounded-xl border border-obsidian-700 bg-obsidian-900 px-6 py-3 text-sm font-display font-bold tracking-wider text-neutral-200 transition hover:border-obsidian-600 hover:bg-obsidian-850 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane active:scale-[0.98]"
          >
            CREATE ACCOUNT
          </Link>
        </div>
      </div>
    </main>
  );
}
