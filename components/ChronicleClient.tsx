"use client";

import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";

interface ChronicleEntry {
  _id: string;
  questId?: {
    _id: string;
    title: string;
    category: string;
    difficulty: string;
  } | null;
  xpEarned: number;
  goldEarned: number;
  attribute: string;
  attributeXp: number;
  completedAt: string;
}

const ATTRIBUTE_ICONS: Record<string, string> = {
  strength: "⚔️",
  intellect: "🧠",
  vitality: "💚",
  focus: "🎯",
  discipline: "🛡️",
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
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 pb-16">
      <Navigation />

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 space-y-8">
        {/* Header Banner */}
        <div className="border-b border-neutral-800 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 mb-2">
            <span>📜</span>
            <span>CHRONICLE OF ASCENSION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            CHRONICLE
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-400">
            A permanent ledger of conquered quests and personal triumphs.
          </p>
        </div>

        {/* Chronicle Entries */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-24 rounded-2xl border border-neutral-800 bg-neutral-900/40 animate-pulse"
              />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/60 text-2xl mb-4">
              📜
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white uppercase">
              Your Chronicle Is Empty
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400 max-w-sm">
              Complete your first quest to begin recording your heroic legacy.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {history.map((entry) => {
              const icon = ATTRIBUTE_ICONS[entry.attribute] || "✨";
              const title = entry.questId?.title || "Conquered Quest";

              return (
                <div
                  key={entry._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 backdrop-blur-md shadow-md hover:border-neutral-700/80 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-400 font-bold">✓ Conquered</span>
                      <span className="text-neutral-600">•</span>
                      <time className="text-xs font-mono text-neutral-500">
                        {formatDate(entry.completedAt)}
                      </time>
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {title}
                    </h3>
                  </div>

                  {/* Rewards Summary */}
                  <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-mono self-start sm:self-auto">
                    <span className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 font-semibold text-indigo-300">
                      +{entry.xpEarned} XP
                    </span>
                    <span className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 font-semibold text-yellow-300">
                      +{entry.goldEarned} Gold
                    </span>
                    <span className="rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1 font-semibold text-neutral-300 capitalize flex items-center gap-1">
                      <span>{icon}</span>
                      <span>+{entry.attributeXp} {entry.attribute}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
