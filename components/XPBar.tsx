import React from "react";
import { Zap } from "lucide-react";

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
    <div className="w-full space-y-2">
      <div className="flex justify-between items-baseline text-xs">
        <span className="flex items-center gap-1.5 font-display font-semibold tracking-wider text-arcane-light">
          <Zap className="h-3.5 w-3.5" aria-hidden="true" />
          RANK {level} THRESHOLD
        </span>
        <span className="font-mono text-neutral-400">
          <strong className="text-white">{currentXp}</strong> / {nextLevelTargetXp} XP ({percentage}%)
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-obsidian-950 border border-obsidian-800 p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-arcane-dark via-arcane to-arcane-light transition-all duration-700 ease-out shadow-arcane"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
