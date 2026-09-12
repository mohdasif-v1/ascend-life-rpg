import React from "react";

interface XPBarProps {
  currentXp: number;
  currentLevelBaseXp: number;
  nextLevelTargetXp: number;
  level: number;
}

export default function XPBar({
  currentXp,
  currentLevelBaseXp,
  nextLevelTargetXp,
  level,
}: XPBarProps) {
  const range = Math.max(1, nextLevelTargetXp - currentLevelBaseXp);
  const progressInLevel = Math.max(0, currentXp - currentLevelBaseXp);
  const percentage = Math.min(100, Math.max(0, Math.round((progressInLevel / range) * 100)));

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-indigo-400">
          Rank {level} Progression
        </span>
        <span className="font-mono text-neutral-400">
          {currentXp} / {nextLevelTargetXp} XP ({percentage}%)
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-900 border border-neutral-800 p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-700 ease-out shadow-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
