"use client";

import { useState, useEffect, useCallback } from "react";
import { Scroll, CheckCircle2, Zap, Coins, Swords, Brain, Heart, Crosshair, Shield, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";

interface ChronicleEntry {
  _id: string;
  questId?: {
    _id: string;
    title: string;
    category: string;
    difficulty: string;
    source?: "manual" | "ai";
  } | null;
  xpEarned: number;
  goldEarned: number;
  attribute: string;
  attributeXp: number;
  completedAt: string;
}

const ATTRIBUTE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  strength: Swords,
  intellect: Brain,
  vitality: Heart,
  focus: Crosshair,
  discipline: Shield,
};

export default function ChronicleClient() {
  const [history, setHistory] = useState<ChronicleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/quests/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  function formatDate(dateString: string) {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-obsidian-950 text-neutral-100 pb-16 bg-arcane-radial bg-rpg-grid">
      <Navigation />

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 space-y-8">
        {/* Header Banner */}
        <div className="border-b border-obsidian-800 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-arcane/40 bg-arcane/15 px-3 py-0.5 text-xs font-semibold text-arcane-light mb-2">
            <Scroll className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-display font-bold">PERMANENT RECORD</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wide text-white">
            CHRONICLE OF ASCENSION
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-400">
            A permanent immutable ledger of completed objectives and personal triumphs
          </p>
        </div>

        {/* Chronicle Entries */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-24 rounded-2xl border border-obsidian-800 bg-obsidian-900/40 animate-pulse"
              />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-obsidian-750 bg-obsidian-900/30 p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-obsidian-700 bg-obsidian-850 text-arcane-light mb-4 shadow-sm">
              <Scroll className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="font-display font-bold text-lg tracking-wide text-white">
              YOUR CHRONICLE IS EMPTY
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400 max-w-sm">
              Conquer your first quest to start forging your permanent heroic legacy.
            </p>
            <a
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-arcane hover:bg-arcane-dark px-5 py-2.5 text-xs font-display font-bold tracking-wider text-white shadow-arcane transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane-light active:scale-[0.98]"
            >
              GO TO COMMAND NEXUS
            </a>
          </div>
        ) : (
          <section aria-label="Quest History Ledger" className="space-y-3.5">
            {history.map((entry) => {
              const AttrIcon = ATTRIBUTE_ICONS[entry.attribute] || Zap;
              const title = entry.questId?.title || "Conquered Objective";

              return (
                <article
                  key={entry._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-obsidian-800 bg-obsidian-900/70 p-5 backdrop-blur-md shadow-md hover:border-obsidian-700 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Fulfilled</span>
                      </span>
                      {entry.questId?.source === "ai" && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-arcane/40 bg-arcane/15 px-2 py-0.5 text-[10px] font-bold text-arcane-light">
                          <Sparkles className="h-2.5 w-2.5 text-arcane-light" aria-hidden="true" />
                          <span>AI-FORGED</span>
                        </span>
                      )}
                      <span className="text-obsidian-700 font-bold">•</span>
                      <time className="text-xs font-mono text-neutral-500">
                        {formatDate(entry.completedAt)}
                      </time>
                    </div>
                    <h3 className="font-display font-bold text-base text-white tracking-wide">
                      {title}
                    </h3>
                  </div>

                  {/* Rewards Summary */}
                  <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-mono self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1 rounded-lg border border-arcane/30 bg-arcane/15 px-2.5 py-1 font-semibold text-arcane-light">
                      <Zap className="h-3 w-3" aria-hidden="true" />
                      <span>+{entry.xpEarned} XP</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg border border-yellow-500/25 bg-yellow-500/10 px-2.5 py-1 font-semibold text-yellow-300">
                      <Coins className="h-3 w-3" aria-hidden="true" />
                      <span>+{entry.goldEarned} Gold</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg border border-obsidian-700 bg-obsidian-950 px-2.5 py-1 font-semibold text-neutral-300 capitalize">
                      <AttrIcon className="h-3 w-3 text-arcane-light" aria-hidden="true" />
                      <span>+{entry.attributeXp} {entry.attribute}</span>
                    </span>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
