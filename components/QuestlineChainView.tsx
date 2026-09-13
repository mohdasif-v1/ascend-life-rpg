"use client";

import React from "react";
import { Compass, CheckCircle2, Lock, ArrowRight, Sparkles, Award } from "lucide-react";
import { IQuest } from "@/models/Quest";

export interface QuestlineItem {
  _id: string;
  title: string;
  goal: string;
  status: "active" | "completed" | "abandoned";
  quests: IQuest[];
}

interface QuestlineChainViewProps {
  questlines: QuestlineItem[];
  onCompleteQuest: (id: string) => void;
  completingId: string | null;
}

export default function QuestlineChainView({
  questlines,
  onCompleteQuest,
  completingId,
}: QuestlineChainViewProps) {
  if (!questlines || questlines.length === 0) return null;

  return (
    <section aria-label="Active Questlines" className="space-y-6">
      <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-arcane/40 bg-arcane/20 text-arcane-light">
            <Compass className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg tracking-wide text-white">
              QUESTLINE CAMPAIGNS
            </h2>
            <p className="text-xs text-neutral-400">
              Chained progression pipelines with sequential milestone unlocks
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-arcane-light font-semibold">
          {questlines.length} Active {questlines.length === 1 ? "Campaign" : "Campaigns"}
        </span>
      </div>

      <div className="space-y-6">
        {questlines.map((ql) => {
          const completedCount = ql.quests.filter((q) => q.completed).length;
          const totalCount = ql.quests.length;
          const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <article
              key={ql._id}
              className="rounded-2xl border border-obsidian-800 bg-obsidian-900/90 p-5 md:p-6 shadow-xl space-y-5"
            >
              {/* Campaign Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-obsidian-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-arcane/40 bg-arcane/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-arcane-light">
                      CAMPAIGN CHAIN
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      {completedCount}/{totalCount} Completed ({percent}%)
                    </span>
                  </div>
                  <h3 className="mt-1 font-display font-bold text-base md:text-lg text-white">
                    {ql.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-400 italic">
                    &ldquo;{ql.goal}&rdquo;
                  </p>
                </div>

                {/* Chain Completion Bonus Pill */}
                <div className="flex items-center gap-2 self-start sm:self-auto rounded-xl border border-relic-gold/30 bg-relic-gold/10 px-3 py-1.5 text-xs font-mono font-semibold text-relic-gold">
                  <Award className="h-4 w-4 text-relic-gold" aria-hidden="true" />
                  <span>Grand Bonus: +200 XP &amp; +100 Gold</span>
                </div>
              </div>

              {/* Connected Visual Step Chain */}
              <div className="relative">
                {/* Horizontal / Vertical Timeline Connection Line */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 relative z-10">
                  {ql.quests.map((quest, idx) => {
                    const isCompleted = quest.completed;
                    const isLocked = quest.locked;
                    const isCurrent = !isCompleted && !isLocked;

                    return (
                      <div
                        key={String(quest._id)}
                        className={`relative rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                          isCompleted
                            ? "border-emerald-500/30 bg-emerald-950/20 opacity-80"
                            : isCurrent
                            ? "border-arcane shadow-arcane-sm bg-obsidian-950/90 ring-1 ring-arcane/50"
                            : "border-obsidian-800/50 bg-obsidian-950/40 opacity-60"
                        }`}
                      >
                        <div>
                          {/* Step Badge & State */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-mono font-bold ${
                                isCompleted
                                  ? "bg-emerald-500 text-obsidian-950"
                                  : isCurrent
                                  ? "bg-arcane text-white animate-pulse"
                                  : "bg-obsidian-800 text-neutral-400"
                              }`}
                            >
                              {isCompleted ? "✓" : idx + 1}
                            </span>

                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {isCompleted ? (
                                <span className="text-emerald-400">Fulfilled</span>
                              ) : isCurrent ? (
                                <span className="text-arcane-light">Active Step</span>
                              ) : (
                                <span className="text-neutral-400 inline-flex items-center gap-1">
                                  <Lock className="h-3 w-3 inline" /> Locked
                                </span>
                              )}
                            </span>
                          </div>

                          <h4
                            className={`font-display font-bold text-xs md:text-sm tracking-wide ${
                              isCompleted
                                ? "line-through text-neutral-400"
                                : isCurrent
                                ? "text-white"
                                : "text-neutral-400"
                            }`}
                          >
                            {quest.title}
                          </h4>

                          {quest.description && (
                            <p className="mt-1 text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                              {quest.description}
                            </p>
                          )}
                        </div>

                        {/* Step Rewards & Action */}
                        <div className="mt-4 pt-3 border-t border-obsidian-800/60 flex items-center justify-between gap-2">
                          <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-2">
                            <span className="text-arcane-light font-semibold">+{quest.xpReward} XP</span>
                            <span className="text-relic-gold font-semibold">+{quest.goldReward} G</span>
                          </div>

                          {isCurrent && (
                            <button
                              type="button"
                              onClick={() => onCompleteQuest(String(quest._id))}
                              disabled={completingId === String(quest._id)}
                              className="rounded-lg bg-arcane hover:bg-arcane-dark px-2.5 py-1 text-[11px] font-bold text-white shadow-sm transition disabled:opacity-50"
                            >
                              {completingId === String(quest._id) ? "..." : "Conquer"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
