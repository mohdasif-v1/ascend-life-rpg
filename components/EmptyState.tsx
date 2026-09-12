import React from "react";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/60 text-2xl mb-4">
        ⚔️
      </div>
      <h3 className="text-lg font-bold tracking-tight text-white">
        NO ACTIVE QUESTS
      </h3>
      <p className="mt-1 text-sm text-neutral-400 max-w-sm">
        Your journey begins with a single step. Forge a quest to gain XP, Gold,
        and strengthen your attributes.
      </p>
      <button
        type="button"
        onClick={onCreateClick}
        className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        FORGE QUEST
      </button>
    </div>
  );
}
