"use client";

import React, { useEffect, useRef } from "react";
import { Award, Zap, Coins, Sparkles, ArrowRight } from "lucide-react";
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

const ATTRIBUTE_LABELS: Record<string, { label: string; color: string }> = {
  strength: { label: "Strength", color: "text-rose-400" },
  intellect: { label: "Intellect", color: "text-sky-400" },
  vitality: { label: "Vitality", color: "text-emerald-400" },
  focus: { label: "Focus", color: "text-relic-gold" },
  discipline: { label: "Discipline", color: "text-arcane-light" },
};

export default function CompletionModal({
  isOpen,
  onClose,
  data,
}: CompletionModalProps) {
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        continueButtonRef.current?.focus();
      }, 50);

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
      color: "text-arcane-light",
    };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-md"
    >
      {data.leveledUp && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 bg-arcane/20 animate-asc-flash z-10"
        />
      )}

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-2xl border bg-obsidian-900 p-6 md:p-8 text-center animate-asc-modal ${
          data.leveledUp
            ? "border-arcane shadow-arcane-lg animate-asc-glow"
            : "border-obsidian-750 shadow-2xl"
        }`}
      >
        {data.leveledUp && <LevelUpParticles />}

        {/* Ambient Top Glow */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -top-20 left-1/2 h-44 w-72 -translate-x-1/2 rounded-full blur-3xl ${
            data.leveledUp ? "bg-arcane/35" : "bg-relic-emerald/15"
          }`}
        />

        {/* Screen Reader Live Region */}
        <div className="sr-only" aria-live="polite">
          {data.leveledUp
            ? `Ascended to Level ${data.newLevel}. Quest completed: ${data.questTitle}. Earned ${data.xpEarned} XP and ${data.goldEarned} Gold.`
            : `Quest completed: ${data.questTitle}. Earned ${data.xpEarned} XP and ${data.goldEarned} Gold.`}
        </div>

        {/* Category / Status Pill */}
        {data.leveledUp ? (
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-arcane/50 bg-arcane/20 px-3.5 py-1 text-xs font-semibold tracking-wider text-arcane-light animate-asc-badge">
            <Sparkles className="h-3.5 w-3.5 text-arcane-light" aria-hidden="true" />
            <span className="font-display font-bold">ASCENDED</span>
          </div>
        ) : (
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-relic-emerald/40 bg-relic-emerald/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-emerald-300">
            <Award className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-display font-bold">QUEST CONQUERED</span>
          </div>
        )}

        {/* Main Display Title */}
        <h2
          id="completion-modal-title"
          className="font-display font-black text-2xl sm:text-3xl tracking-wide text-white"
        >
          {data.leveledUp ? "RANK ASCENSION" : "OBJECTIVE FULFILLED"}
        </h2>

        {/* Level Hero Number */}
        {data.leveledUp && (
          <div className="mt-2 font-display font-black text-4xl sm:text-5xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-arcane-light via-white to-sky-300 drop-shadow-sm">
            LEVEL {data.newLevel}
          </div>
        )}

        {/* Quest Title */}
        <p className="mt-3 text-sm text-neutral-300 max-w-sm mx-auto truncate font-medium">
          &ldquo;{data.questTitle}&rdquo;
        </p>

        {/* Rewards Matrix */}
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {/* XP */}
          <div className="rounded-xl border border-obsidian-800 bg-obsidian-950/70 p-3">
            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-neutral-400 mb-1">
              <Zap className="h-3 w-3 text-arcane-light" aria-hidden="true" />
              <span>XP</span>
            </div>
            <div className="font-display font-black text-lg text-arcane-light">
              <AnimatedNumber target={data.xpEarned} prefix="+" />
            </div>
          </div>

          {/* Gold */}
          <div className="rounded-xl border border-obsidian-800 bg-obsidian-950/70 p-3">
            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-neutral-400 mb-1">
              <Coins className="h-3 w-3 text-relic-gold" aria-hidden="true" />
              <span>Gold</span>
            </div>
            <div className="font-display font-black text-lg text-relic-gold">
              <AnimatedNumber target={data.goldEarned} prefix="+" />
            </div>
          </div>

          {/* Attribute Growth */}
          <div className="rounded-xl border border-obsidian-800 bg-obsidian-950/70 p-3">
            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-neutral-400 mb-1 truncate">
              <Award className="h-3 w-3 text-sky-400" aria-hidden="true" />
              <span>{attrMeta.label}</span>
            </div>
            <div className={`font-display font-black text-lg ${attrMeta.color}`}>
              <AnimatedNumber target={data.attributeXp} prefix="+" />
            </div>
          </div>
        </div>

        {/* Streak Indicator */}
        {data.currentStreak > 0 && (
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-mono text-relic-gold/90">
            <Zap className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            <span>{data.currentStreak} Day Continuity Maintained</span>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="mt-7">
          <button
            ref={continueButtonRef}
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-arcane hover:bg-arcane-dark py-3 px-6 text-sm font-display font-bold tracking-wider text-white shadow-arcane transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane-light active:scale-[0.98]"
          >
            CLAIM SPOILS & CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}
