import React from "react";
import { Swords, Brain, Heart, Crosshair, Shield, Check, Trash2, Edit2, Zap, Coins, Sparkles, Flame, Lock } from "lucide-react";
import { IQuest } from "@/models/Quest";

interface QuestCardProps {
  quest: IQuest;
  onComplete: (id: string) => void;
  onEdit: (quest: IQuest) => void;
  onDelete: (id: string) => void;
  isCompleting: boolean;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  medium: "text-sky-300 border-sky-500/30 bg-sky-500/10",
  hard: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  epic: "text-arcane-light border-arcane/40 bg-arcane/15",
};

const ATTRIBUTE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  strength: Swords,
  intellect: Brain,
  vitality: Heart,
  focus: Crosshair,
  discipline: Shield,
};

export default function QuestCard({
  quest,
  onComplete,
  onEdit,
  onDelete,
  isCompleting,
}: QuestCardProps) {
  const questId = String(quest._id);
  const diffStyle = DIFFICULTY_STYLES[quest.difficulty] || DIFFICULTY_STYLES.easy;
  const AttrIcon = ATTRIBUTE_ICONS[quest.attribute] || Zap;
  const isLocked = Boolean(quest.locked);
  const isRedemption = Boolean(quest.isRedemption);

  return (
    <article
      className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 ${
        quest.completed
          ? "border-obsidian-800/80 bg-obsidian-950/40 opacity-70"
          : isRedemption
          ? "border-amber-500/50 bg-gradient-to-b from-amber-950/30 to-obsidian-900/90 shadow-amber-950/30 shadow-xl ring-1 ring-amber-500/20"
          : isLocked
          ? "border-obsidian-800/50 bg-obsidian-950/60 opacity-60 cursor-not-allowed"
          : "border-obsidian-800 bg-obsidian-900/80 hover:border-obsidian-700 shadow-lg"
      }`}
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="rounded-md border border-obsidian-700 bg-obsidian-950 px-2 py-0.5 text-xs font-medium text-neutral-400">
              {quest.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-300 font-medium">
              <AttrIcon className="h-3.5 w-3.5 text-arcane-light" />
              <span className="capitalize">{quest.attribute}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isRedemption && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/50 bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 shadow-sm animate-pulse">
                <Flame className="h-3 w-3 text-amber-400" aria-hidden="true" />
                <span>REDEMPTION</span>
              </span>
            )}
            {!isRedemption && quest.source === "ai" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-arcane/50 bg-arcane/20 px-2.5 py-0.5 text-[10px] font-bold text-arcane-light shadow-sm">
                <Sparkles className="h-3 w-3 text-arcane-light" aria-hidden="true" />
                <span>AI-FORGED</span>
              </span>
            )}
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${diffStyle}`}
            >
              {quest.difficulty}
            </span>
          </div>
        </div>

        {/* Quest Title */}
        <h4
          className={`font-display font-bold text-base tracking-wide flex items-center gap-2 ${
            quest.completed
              ? "line-through text-neutral-400"
              : isRedemption
              ? "text-amber-100"
              : isLocked
              ? "text-neutral-400"
              : "text-white"
          }`}
        >
          {isLocked && <Lock className="h-4 w-4 text-neutral-500 inline shrink-0" aria-label="Locked Quest" />}
          <span>{quest.title}</span>
        </h4>

        {/* Description */}
        {quest.description && (
          <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed line-clamp-2">
            {quest.description}
          </p>
        )}
      </div>

      {/* Rewards & Actions */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-obsidian-800 pt-4">
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="inline-flex items-center gap-1 font-semibold text-arcane-light">
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            <span>+{quest.xpReward} XP</span>
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-relic-gold">
            <Coins className="h-3.5 w-3.5" aria-hidden="true" />
            <span>+{quest.goldReward} Gold</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {quest.completed ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Fulfilled</span>
            </span>
          ) : isLocked ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-obsidian-800 bg-obsidian-950 px-3 py-1.5 text-xs font-medium text-neutral-400">
              <Lock className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
              <span>Locked</span>
            </span>
          ) : (
            <>
              {!isRedemption && (
                <button
                  type="button"
                  onClick={() => onEdit(quest)}
                  aria-label={`Edit quest: ${quest.title}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-obsidian-800 bg-obsidian-950 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-obsidian-700 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane"
                >
                  <Edit2 className="h-3 w-3" aria-hidden="true" />
                  <span>Edit</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onComplete(questId)}
                disabled={isCompleting}
                aria-label={`Complete quest: ${quest.title}`}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition focus:outline-none focus-visible:ring-2 disabled:opacity-50 ${
                  isRedemption
                    ? "bg-amber-600 hover:bg-amber-500 focus-visible:ring-amber-400 shadow-amber-900/50"
                    : "bg-arcane hover:bg-arcane-dark focus-visible:ring-arcane-light"
                }`}
              >
                {isCompleting ? "Conquering..." : isRedemption ? "Rekindle Streak" : "Conquer"}
              </button>
            </>
          )}

          {!isRedemption && (
            <button
              type="button"
              onClick={() => onDelete(questId)}
              aria-label={`Delete quest: ${quest.title}`}
              className="rounded-lg border border-obsidian-800 bg-obsidian-950 p-2 text-neutral-400 hover:border-rose-900/50 hover:bg-rose-500/10 hover:text-rose-400 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
