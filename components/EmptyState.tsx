import React from "react";
import { Plus, Compass } from "lucide-react";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-obsidian-750 bg-obsidian-900/30 p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-obsidian-700 bg-obsidian-850 text-arcane-light mb-4 shadow-sm">
        <Compass className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="font-display font-bold text-lg tracking-wide text-white">
        NO ACTIVE QUESTS
      </h3>
      <p className="mt-1 text-sm text-neutral-400 max-w-sm">
        Your chronicle awaits. Forge a daily quest to earn XP, acquire gold, and ascend through the ranks.
      </p>
      <button
        type="button"
        onClick={onCreateClick}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-arcane hover:bg-arcane-dark px-5 py-2.5 text-sm font-semibold text-white shadow-arcane transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane-light"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        <span>FORGE QUEST</span>
      </button>
    </div>
  );
}
