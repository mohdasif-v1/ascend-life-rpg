"use client";

import React, { useState } from "react";
import { Compass, Loader2, Sparkles, X, ChevronRight, Swords, Brain, Heart, Crosshair, Shield, Zap, Coins, Trash2 } from "lucide-react";
import { ValidatedQuestlineStepDraft } from "@/lib/ai";
import { QuestDifficulty, RPGAttribute } from "@/models/Quest";

interface QuestlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestlineCreated: () => Promise<void>;
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

export default function QuestlineModal({
  isOpen,
  onClose,
  onQuestlineCreated,
  aiGenerationsToday,
  dailyLimit,
}: QuestlineModalProps) {
  const [goal, setGoal] = useState("");
  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState<ValidatedQuestlineStepDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(dailyLimit - aiGenerationsToday);

  React.useEffect(() => {
    if (isOpen) {
      setRemaining(Math.max(0, dailyLimit - aiGenerationsToday));
      setError(null);
    }
  }, [isOpen, aiGenerationsToday, dailyLimit]);

  if (!isOpen) return null;

  async function handleDecompose(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) {
      setError("State your campaign objective so the Cartographer may chart the questline.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/questlines/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goal.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "The Cartographer could not decompose your vision. Please try again.");
        if (data.limitReached) {
          setRemaining(0);
        }
        return;
      }

      setTitle(data.title || "The Ascent Campaign");
      setSteps(data.steps || []);
      if (typeof data.remainingGenerations === "number") {
        setRemaining(data.remainingGenerations);
      }
    } catch {
      setError("A mystic interference severed the Cartographer connection. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleStepChange(index: number, field: keyof ValidatedQuestlineStepDraft, value: string) {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        return { ...s, [field]: value };
      })
    );
  }

  function handleRemoveStep(index: number) {
    if (steps.length <= 2) {
      setError("A questline requires at least 2 progressive steps.");
      return;
    }
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleConfirmQuestline() {
    if (steps.length < 2) {
      setError("Please keep at least 2 progressive steps in the chain.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/questlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Epic Campaign",
          goal: goal.trim(),
          steps,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to instantiate questline. Please try again.");
        return;
      }

      await onQuestlineCreated();
      onClose();
    } catch {
      setError("Network fault while forging the questline chain.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="questline-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm overflow-y-auto py-8"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-obsidian-750 bg-obsidian-900 p-6 md:p-8 shadow-2xl animate-asc-modal max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-obsidian-800 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-arcane/50 bg-arcane/20 text-arcane-light">
              <Compass className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="questline-modal-title" className="font-display font-black text-lg text-white">
                FORGE QUESTLINE
              </h2>
              <p className="text-xs text-neutral-400">
                Decompose large ambitions into sequential, escalating quest chains
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-obsidian-800 hover:text-white transition"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto space-y-6 pt-5 pr-1 flex-1">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          {steps.length === 0 ? (
            /* Input Form */
            <form onSubmit={handleDecompose} className="space-y-4">
              <div>
                <label
                  htmlFor="campaign-goal"
                  className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5"
                >
                  Grand Objective / Campaign Ambition
                </label>
                <textarea
                  id="campaign-goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Master TypeScript and launch a full-stack SaaS in 30 days, or Run a 10k race..."
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-xl border border-obsidian-750 bg-obsidian-950 p-3.5 text-sm text-white placeholder-neutral-500 focus:border-arcane focus:outline-none focus:ring-1 focus:ring-arcane"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>AI Energy Remaining: {remaining}/{dailyLimit}</span>
                <span className="text-[11px]">Chain size: 3–5 progressive steps</span>
              </div>

              <button
                type="submit"
                disabled={loading || !goal.trim() || remaining <= 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-arcane hover:bg-arcane-dark py-3 text-xs font-display font-bold uppercase tracking-wider text-white shadow-arcane transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Cartographing Chain...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Decompose into Questline</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Draft Review & Reorder/Edit Screen */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-obsidian-750 bg-obsidian-950 px-3.5 py-2 text-sm font-display font-bold text-white focus:border-arcane focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Sequential Progression (Step 1 Unlocked, Subsequent Steps Locked)
                </span>

                {steps.map((step, idx) => {
                  const diffStyle = DIFFICULTY_STYLES[step.difficulty] || DIFFICULTY_STYLES.easy;
                  const AttrIcon = ATTRIBUTE_ICONS[step.attribute] || Zap;

                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-obsidian-800 bg-obsidian-950/60 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-arcane/20 border border-arcane/40 text-xs font-mono font-bold text-arcane-light">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold uppercase text-neutral-300">
                            {idx === 0 ? "Initial Trial (Unlocked)" : `Phase ${idx + 1} (Locked)`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${diffStyle}`}
                          >
                            {step.difficulty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(idx)}
                            aria-label={`Remove step ${idx + 1}`}
                            className="rounded p-1 text-neutral-400 hover:text-rose-400 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleStepChange(idx, "title", e.target.value)}
                        className="w-full rounded-lg border border-obsidian-800 bg-obsidian-900 px-3 py-1.5 text-xs font-medium text-white focus:border-arcane focus:outline-none"
                      />

                      <textarea
                        value={step.description}
                        onChange={(e) => handleStepChange(idx, "description", e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-obsidian-800 bg-obsidian-900 p-2 text-xs text-neutral-300 focus:border-arcane focus:outline-none"
                      />

                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                        <span className="inline-flex items-center gap-1">
                          <AttrIcon className="h-3 w-3 text-arcane-light" />
                          <span className="capitalize">{step.attribute}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-arcane-light">+{step.xpReward} XP</span>
                          <span className="text-relic-gold">+{step.goldReward} Gold</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSteps([])}
                  className="flex-1 rounded-xl border border-obsidian-750 bg-obsidian-950 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white transition"
                >
                  Discard & Re-chart
                </button>
                <button
                  type="button"
                  onClick={handleConfirmQuestline}
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-arcane hover:bg-arcane-dark py-2.5 text-xs font-display font-bold uppercase tracking-wider text-white shadow-arcane transition disabled:opacity-50"
                >
                  {submitting ? "Instantiating Chain..." : "Accept & Bind Questline"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
