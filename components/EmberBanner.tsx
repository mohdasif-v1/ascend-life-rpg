"use client";

import React, { useEffect, useState } from "react";
import { Flame, Clock, Zap, ArrowRight } from "lucide-react";

interface EmberBannerProps {
  emberDeadline: string | Date | null;
  preStreakValue: number | null;
  onScrollToRedemption?: () => void;
}

export default function EmberBanner({
  emberDeadline,
  preStreakValue,
  onScrollToRedemption,
}: EmberBannerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!emberDeadline) return;

    function updateCountdown() {
      const now = new Date().getTime();
      const target = new Date(emberDeadline!).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("00h 00m 00s — Expiring");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, "0");
      setTimeLeft(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [emberDeadline]);

  return (
    <aside
      aria-label="Ember Streak Forgiveness Notice"
      className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/50 via-obsidian-900 to-amber-950/30 p-5 md:p-6 shadow-xl shadow-amber-950/20"
    >
      {/* Subtle background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-amber-500/15 blur-3xl"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/20 text-amber-300 shadow-sm">
            <Flame className="h-5 w-5 animate-pulse text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xs uppercase tracking-widest text-amber-400">
                SACRED EMBER FLICKERING
              </span>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/30">
                1-DAY FORGIVENESS
              </span>
            </div>
            <h2 className="mt-1 font-display font-black text-lg text-white">
              Rekindle Your {preStreakValue ? `${preStreakValue}-Day ` : ""}Flame Before Midnight
            </h2>
            <p className="mt-1 text-xs text-neutral-300 max-w-xl leading-relaxed">
              You missed yesterday, but your fire is not extinguished. Complete your designated
              Redemption Quest today to restore your full streak counter +1.
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 border-amber-500/20 pt-3 sm:pt-0">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-300">
            <Clock className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <span>{timeLeft || "Expires at 23:59 UTC"}</span>
          </div>

          {onScrollToRedemption && (
            <button
              type="button"
              onClick={onScrollToRedemption}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-2.5 py-1 rounded-lg text-xs font-bold font-display uppercase tracking-wider text-amber-300 hover:text-amber-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-[0.98]"
            >
              <span>View Redemption Quest</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
