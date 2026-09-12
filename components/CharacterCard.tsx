import React from "react";
import { Flame, Coins, ShieldCheck } from "lucide-react";
import XPBar from "./XPBar";

interface CharacterCardProps {
  email: string;
  level: number;
  xp: number;
  gold: number;
  currentStreak: number;
  currentLevelBaseXp: number;
  nextLevelTargetXp: number;
}

export default function CharacterCard({
  email,
  level,
  xp,
  gold,
  currentStreak,
  currentLevelBaseXp,
  nextLevelTargetXp,
}: CharacterCardProps) {
  return (
    <section aria-label="Character Matrix" className="relative overflow-hidden rounded-2xl border border-obsidian-800 bg-obsidian-900/80 p-6 backdrop-blur-xl shadow-xl">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-arcane/10 blur-3xl"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-obsidian-800">
        <div>
          <span className="text-xs font-semibold tracking-wider text-neutral-400 block mb-1">
            PLAYER PROFILE
          </span>
          <h2 className="font-display font-bold text-2xl tracking-wide text-white">
            {email}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Flame / Continuity Streak */}
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-1.5 text-xs font-medium text-amber-300">
            <Flame className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <span>{currentStreak} Day Flame</span>
          </div>

          {/* Treasury / Gold */}
          <div className="flex items-center gap-2 rounded-xl border border-yellow-500/25 bg-yellow-500/10 px-3.5 py-1.5 text-xs font-medium text-yellow-300">
            <Coins className="h-4 w-4 text-yellow-400" aria-hidden="true" />
            <span className="font-display font-bold text-sm">{gold}</span>
            <span>Gold</span>
          </div>

          {/* Level Hero Tag */}
          <div className="flex items-center gap-2 rounded-xl border border-arcane/40 bg-arcane/20 px-4 py-1.5 text-xs font-display font-bold text-arcane-light shadow-sm">
            <ShieldCheck className="h-4 w-4 text-arcane-light" aria-hidden="true" />
            <span className="text-sm tracking-wider">LEVEL {level}</span>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <XPBar
          currentXp={xp}
          currentLevelBaseXp={currentLevelBaseXp}
          nextLevelTargetXp={nextLevelTargetXp}
          level={level}
        />
      </div>
    </section>
  );
}
