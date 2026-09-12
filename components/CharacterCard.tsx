import React from "react";
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
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-xl shadow-xl">
      {/* Subtle top glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-neutral-500">
            Character Profile
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
            {email}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Flame / Streak */}
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300">
            <span className="text-base">🔥</span>
            <span>{currentStreak} Day Flame</span>
          </div>

          {/* Gold / Currency */}
          <div className="flex items-center gap-1.5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3.5 py-1.5 text-xs font-semibold text-yellow-300">
            <span className="text-base">🪙</span>
            <span>{gold} Gold</span>
          </div>

          {/* Level Badge */}
          <div className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/15 px-3.5 py-1.5 text-xs font-bold text-indigo-300">
            <span>LEVEL {level}</span>
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
    </div>
  );
}
