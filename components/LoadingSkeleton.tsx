import React from "react";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top character card skeleton */}
      <div className="h-44 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6" />

      {/* Attributes skeleton */}
      <div className="h-32 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6" />

      {/* Quests skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-neutral-900/60" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 rounded-2xl border border-neutral-800 bg-neutral-900/40" />
          <div className="h-40 rounded-2xl border border-neutral-800 bg-neutral-900/40" />
        </div>
      </div>
    </div>
  );
}
