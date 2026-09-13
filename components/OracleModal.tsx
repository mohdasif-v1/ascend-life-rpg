"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, Check, AlertCircle, X, Shield, Swords, Brain, Heart, Crosshair, Zap, Coins } from "lucide-react";
import { ValidatedQuestDraft } from "@/lib/ai";
import { QuestDifficulty, RPGAttribute } from "@/models/Quest";

interface OracleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestsCreated: () => Promise<void>;
  aiGenerationsToday: number;
  dailyLimit: number;
}

const ATTRIBUTE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  strength: Swords,
  intellect: Brain,
  vitality: Heart,
  focus: Crosshair,
  discipline: Shield,
};

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  medium: "text-sky-300 border-sky-500/30 bg-sky-500/10",
  hard: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  epic: "text-arcane-light border-arcane/40 bg-arcane/15",
};

export default function OracleModal({
  isOpen,
  onClose,
  onQuestsCreated,
  aiGenerationsToday,
  dailyLimit,
}: OracleModalProps) {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<ValidatedQuestDraft[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [remaining, setRemaining] = useState<number>(dailyLimit - aiGenerationsToday);

  // Sync remaining quota when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setRemaining(Math.max(0, dailyLimit - aiGenerationsToday));
      setError(null);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, aiGenerationsToday, dailyLimit, onClose]);

  if (!isOpen) return null;

  const isQuotaDepleted = remaining <= 0;

  async function handleConsultOracle(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) {
      setError("State your ambition so the Oracle may divine your trials.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/quests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goal.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "The Oracle could not discern your vision. Please try again.");
        if (data.limitReached) {
          setRemaining(0);
        }
        return;
      }

      setDrafts(data.drafts || []);
      // Pre-select all generated drafts by default
      setSelectedIndices(data.drafts ? data.drafts.map((_: any, idx: number) => idx) : []);
      if (typeof data.remainingGenerations === "number") {
        setRemaining(data.remainingGenerations);
      }
    } catch {
      setError("A mystic interference severed the Oracle connection. Check your network and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDraftChange(index: number, field: keyof ValidatedQuestDraft, value: string) {
    setDrafts((prev) =>
      prev.map((d, i) => {
        if (i !== index) return d;
        return { ...d, [field]: value };
      })
    );
  }

  function toggleSelect(index: number) {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  async function handleConfirmQuests() {
    if (selectedIndices.length === 0) {
      setError("Select at least one quest trial to forge into your active chronicle.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      // Post each chosen quest to the authoritative creation route
      const chosenDrafts = drafts.filter((_, idx) => selectedIndices.includes(idx));
      for (const draft of chosenDrafts) {
        const res = await fetch("/api/quests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: draft.title,
            description: draft.description,
            category: draft.category,
            attribute: draft.attribute,
            difficulty: draft.difficulty,
            source: "ai",
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to forge one of the chosen quests.");
        }
      }

      await onQuestsCreated();
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to save forged quests. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setDrafts([]);
    setSelectedIndices([]);
    setGoal("");
    setError(null);
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="oracle-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md overflow-y-auto py-10"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-obsidian-800 bg-obsidian-900 p-6 md:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-obsidian-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-arcane/40 bg-arcane/20 text-arcane-light shadow-arcane">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="oracle-modal-title" className="font-display font-black text-xl text-white tracking-wide">
                ORACLE OF THE ASCENDED
              </h2>
              <p className="text-xs text-neutral-400">
                Imbue your real-world ambitions into calculated RPG progression
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close Oracle dialog"
            className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-obsidian-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Quota counter badge */}
        <div className="flex items-center justify-between rounded-xl border border-obsidian-800 bg-obsidian-950/70 px-4 py-2.5 text-xs font-mono">
          <span className="text-neutral-400">Oracle Power Remaining Today:</span>
          <span
            className={`font-bold ${
              remaining > 0 ? "text-arcane-light" : "text-rose-400"
            }`}
          >
            {remaining} / {dailyLimit} Divinations
          </span>
        </div>

        {/* Error notification */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Input Ambition (if no drafts yet) */}
        {drafts.length === 0 ? (
          <form onSubmit={handleConsultOracle} className="space-y-4">
            <div>
              <label
                htmlFor="oracle-goal-input"
                className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5"
              >
                What mortal ambition do you wish to conquer?
              </label>
              <textarea
                id="oracle-goal-input"
                rows={3}
                required
                disabled={loading || isQuotaDepleted}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Prepare for technical interviews by mastering dynamic programming and graph algorithms this week."
                className="w-full rounded-xl border border-obsidian-750 bg-obsidian-950 px-4 py-3 text-sm text-white placeholder-neutral-500 transition focus:border-arcane focus:outline-none focus-visible:ring-1 focus-visible:ring-arcane disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-obsidian-750 px-5 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-obsidian-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane"
              >
                Depart
              </button>
              <button
                type="submit"
                disabled={loading || isQuotaDepleted || !goal.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-arcane hover:bg-arcane-dark px-6 py-2.5 text-xs font-display font-bold tracking-wider text-white shadow-arcane transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane-light disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>DIVINING QUESTS...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    <span>CONSULT ORACLE</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: Review and refine drafts */
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-white tracking-wide">
                ORACLE DIVINATIONS (REVIEW & EDIT)
              </h3>
              <span className="text-xs text-neutral-400">
                {selectedIndices.length} of {drafts.length} trials chosen
              </span>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {drafts.map((draft, idx) => {
                const isSelected = selectedIndices.includes(idx);
                const AttrIcon = ATTRIBUTE_ICONS[draft.attribute] || Zap;
                const diffStyle = DIFFICULTY_STYLES[draft.difficulty] || DIFFICULTY_STYLES.easy;

                return (
                  <article
                    key={idx}
                    className={`rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? "border-arcane/60 bg-obsidian-950/80 shadow-arcane"
                        : "border-obsidian-800 bg-obsidian-950/40 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id={`draft-select-${idx}`}
                        checked={isSelected}
                        onChange={() => toggleSelect(idx)}
                        className="mt-1 h-4 w-4 rounded border-obsidian-700 bg-obsidian-900 text-arcane focus:ring-arcane"
                      />

                      <div className="flex-1 space-y-3">
                        {/* Title input for editing */}
                        <div className="flex items-center justify-between gap-3">
                          <input
                            type="text"
                            value={draft.title}
                            onChange={(e) => handleDraftChange(idx, "title", e.target.value)}
                            className="w-full rounded-lg border border-obsidian-750 bg-obsidian-900 px-3 py-1.5 text-sm font-display font-bold text-white focus:border-arcane focus:outline-none"
                            placeholder="Quest Title"
                          />
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase shrink-0 ${diffStyle}`}
                          >
                            {draft.difficulty}
                          </span>
                        </div>

                        {/* Description input */}
                        <textarea
                          rows={2}
                          value={draft.description}
                          onChange={(e) => handleDraftChange(idx, "description", e.target.value)}
                          className="w-full rounded-lg border border-obsidian-800 bg-obsidian-900 px-3 py-1 text-xs text-neutral-300 focus:border-arcane focus:outline-none"
                          placeholder="Tactical instructions"
                        />

                        {/* Rewards & Category preview */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="rounded border border-obsidian-750 bg-obsidian-900 px-2 py-0.5 text-[11px] text-neutral-400">
                              {draft.category}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-neutral-300 font-medium">
                              <AttrIcon className="h-3 w-3 text-arcane-light" />
                              <span className="capitalize">{draft.attribute}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 font-mono text-[11px]">
                            <span className="text-arcane-light font-semibold">+{draft.xpReward} XP</span>
                            <span className="text-relic-gold font-semibold">+{draft.goldReward} Gold</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Confirm Actions */}
            <div className="flex items-center justify-between border-t border-obsidian-800 pt-4">
              <button
                type="button"
                onClick={() => setDrafts([])}
                className="rounded-xl border border-obsidian-750 px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-obsidian-800 transition"
              >
                Re-consult
              </button>

              <button
                type="button"
                onClick={handleConfirmQuests}
                disabled={submitting || selectedIndices.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-arcane hover:bg-arcane-dark px-6 py-2.5 text-xs font-display font-bold tracking-wider text-white shadow-arcane transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane-light disabled:opacity-50 active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>FORGING OBJECTIVES...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span>ACCEPT {selectedIndices.length} SELECTED QUESTS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
