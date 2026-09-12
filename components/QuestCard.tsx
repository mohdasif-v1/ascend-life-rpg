import React from "react";
import { IQuest } from "@/models/Quest";

interface QuestCardProps {
  quest: IQuest;
  onComplete: (id: string) => void;
  onEdit: (quest: IQuest) => void;
  onDelete: (id: string) => void;
  isCompleting: boolean;
}

const DIFFICULTY_COLORS = {
  easy: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  medium: "text-sky-400 border-sky-500/20 bg-sky-500/10",
  hard: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  epic: "text-purple-400 border-purple-500/20 bg-purple-500/10",
};

const ATTRIBUTE_ICONS: Record<string, string> = {
  strength: "⚔️",
  intellect: "🧠",
  vitality: "💚",
  focus: "🎯",
  discipline: "🛡️",
};

export default function QuestCard({
  quest,
  onComplete,
  onEdit,
  onDelete,
  isCompleting,
}: QuestCardProps) {
  const questId = String(quest._id);
  const diffStyle =
    DIFFICULTY_COLORS[quest.difficulty as keyof typeof DIFFICULTY_COLORS] ||
    DIFFICULTY_COLORS.easy;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 ${
        quest.completed
          ? "border-neutral-800/60 bg-neutral-900/30 opacity-75"
          : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900/80 shadow-lg"
      }`}
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {/* Category */}
            <span className="rounded-md border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-xs font-medium text-neutral-400">
              {quest.category}
            </span>
            {/* Attribute */}
            <span className="inline-flex items-center gap-1 text-xs text-neutral-300 font-medium">
              <span>{ATTRIBUTE_ICONS[quest.attribute] || "✨"}</span>
              <span className="capitalize">{quest.attribute}</span>
            </span>
          </div>

          {/* Difficulty */}
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${diffStyle}`}
          >
            {quest.difficulty}
          </span>
        </div>

        {/* Quest Title */}
        <h4
          className={`text-base font-bold tracking-tight text-white ${
            quest.completed ? "line-through text-neutral-400" : ""
          }`}
        >
          {quest.title}
        </h4>

        {/* Description */}
        {quest.description && (
          <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
            {quest.description}
          </p>
        )}
      </div>

      {/* Footer / Rewards & Actions */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800/80 pt-4">
        {/* Authoritative Rewards */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="inline-flex items-center gap-1 font-semibold text-indigo-400">
            <span>⚡</span>
            <span>+{quest.xpReward} XP</span>
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-yellow-400">
            <span>🪙</span>
            <span>+{quest.goldReward} Gold</span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {quest.completed ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <span>✓</span> Conquered
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onEdit(quest)}
                aria-label={`Edit quest: ${quest.title}`}
                className="rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:border-neutral-700 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onComplete(questId)}
                disabled={isCompleting}
                aria-label={`Complete quest: ${quest.title}`}
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50"
              >
                {isCompleting ? "Conquering..." : "Conquer"}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onDelete(questId)}
            aria-label={`Delete quest: ${quest.title}`}
            className="rounded-lg border border-neutral-800 bg-neutral-950 p-1.5 text-neutral-500 hover:border-rose-900/50 hover:bg-rose-500/10 hover:text-rose-400 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <span className="text-xs" aria-hidden="true">🗑️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
