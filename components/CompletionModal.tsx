"use client";

import React, { useEffect, useRef } from "react";
import AnimatedNumber from "./AnimatedNumber";
import LevelUpParticles from "./LevelUpParticles";

export interface CompletionData {
  questTitle: string;
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
  xpEarned: number;
  goldEarned: number;
  attribute: string;
  attributeXp: number;
  attributeValue: number;
  currentStreak: number;
}

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CompletionData | null;
}

const ATTRIBUTE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  strength: { label: "Strength", icon: "⚔️", color: "text-rose-400" },
  intellect: { label: "Intellect", icon: "🧠", color: "text-sky-400" },
  vitality: { label: "Vitality", icon: "💚", color: "text-emerald-400" },
  focus: { label: "Focus", icon: "🎯", color: "text-amber-400" },
  discipline: { label: "Discipline", icon: "🛡️", color: "text-purple-400" },
};

export default function CompletionModal({
  isOpen,
  onClose,
  data,
}: CompletionModalProps) {
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Accessibility: focus the primary action when modal opens
      const timer = setTimeout(() => {
        continueButtonRef.current?.focus();
      }, 50);

      // Handle Escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const attrMeta =
    ATTRIBUTE_LABELS[data.attribute] || {
      label: data.attribute,
      icon: "✨",
      color: "text-indigo-400",
    };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md"
    >
      {/* Subtle screen flash if leveled up */}
      {data.leveledUp && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 bg-indigo-500/20 animate-asc-flash z-10"
        />
      )}

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-3xl border bg-neutral-950 p-6 md:p-8 text-center shadow-2xl animate-asc-modal ${
          data.leveledUp
            ? "border-indigo-500/60 shadow-indigo-500/20 animate-asc-glow"
            : "border-neutral-800 shadow-black/80"
        }`}
      >
        {/* Particles for Level-Up */}
        {data.leveledUp && <LevelUpParticles />}

        {/* Ambient Top Glow */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full blur-3xl ${
            data.leveledUp ? "bg-indigo-500/30" : "bg-emerald-500/15"
          }`}
        />

        {/* Screen Reader Live Region */}
        <div className="sr-only" aria-live="polite">
          {data.leveledUp
            ? `Ascended to Level ${data.newLevel}! Quest complete: ${data.questTitle}. Gained ${data.xpEarned} XP and ${data.goldEarned} Gold.`
            : `Quest complete: ${data.questTitle}. Gained ${data.xpEarned} XP and ${data.goldEarned} Gold.`}
        </div>

        {/* Header Badge */}
        {data.leveledUp ? (
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/50 bg-indigo-500/20 px-4 py-1 text-xs font-extrabold uppercase tracking-widest text-indigo-300 animate-asc-badge">
            <span>⭐</span>
            <span>ASCENDED</span>
          </div>
        ) : (
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            <span>✓</span>
            <span>OBJECTIVE CLEARED</span>
          </div>
        )}

        {/* Main Title */}
        <h2
          id="completion-modal-title"
          className={`text-2xl sm:text-3xl font-black tracking-tight text-white ${
            data.leveledUp ? "text-indigo-200" : ""
          }`}
        >
          {data.leveledUp ? "LEVEL UP!" : "QUEST COMPLETE"}
        </h2>

        {/* Level Up Subheading */}
        {data.leveledUp && (
          <div className="mt-2 text-3xl sm:text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-cyan-300">
            LEVEL {data.newLevel}
          </div>
        )}

        {/* Quest Name */}
        <p className="mt-2 text-sm font-medium text-neutral-300 max-w-sm mx-auto truncate">
          &ldquo;{data.questTitle}&rdquo;
        </p>

        {/* Rewards Grid */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {/* XP Reward */}
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-3.5 backdrop-blur-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">
              XP
            </span>
            <div className="text-base sm:text-lg font-mono font-black text-indigo-400">
              <AnimatedNumber target={data.xpEarned} prefix="+" />
            </div>
          </div>

          {/* Gold Reward */}
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-3.5 backdrop-blur-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">
              Gold
            </span>
            <div className="text-base sm:text-lg font-mono font-black text-yellow-400">
              <AnimatedNumber target={data.goldEarned} prefix="+" />
            </div>
          </div>

          {/* Attribute Growth */}
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-3.5 backdrop-blur-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5 truncate">
              {attrMeta.label}
            </span>
            <div className={`text-base sm:text-lg font-mono font-black ${attrMeta.color}`}>
              <AnimatedNumber target={data.attributeXp} prefix="+" />
            </div>
          </div>
        </div>

        {/* Flame Streak Indicator */}
        {data.currentStreak > 0 && (
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-mono text-amber-300/90">
            <span>🔥</span>
            <span>{data.currentStreak} Day Flame Active</span>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="mt-7">
          <button
            ref={continueButtonRef}
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-sm font-bold tracking-wide text-white shadow-lg shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 active:scale-[0.98]"
          >
            Claim Reward & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
