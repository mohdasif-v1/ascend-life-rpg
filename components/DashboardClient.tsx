"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Plus, X, Sparkles, Compass } from "lucide-react";
import CharacterCard from "@/components/CharacterCard";
import AttributeBar from "@/components/AttributeBar";
import QuestCard from "@/components/QuestCard";
import QuestModal from "@/components/QuestModal";
import OracleModal from "@/components/OracleModal";
import QuestlineModal from "@/components/QuestlineModal";
import QuestlineChainView, { QuestlineItem } from "@/components/QuestlineChainView";
import EmberBanner from "@/components/EmberBanner";
import CompletionModal, { CompletionData } from "@/components/CompletionModal";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";
import Navigation from "@/components/Navigation";
import { IQuest } from "@/models/Quest";
import { IUserAttributes } from "@/models/User";

interface CharacterProfile {
  id: string;
  email: string;
  level: number;
  xp: number;
  gold: number;
  currentStreak: number;
  longestStreak: number;
  attributes: IUserAttributes;
  currentLevelBaseXp: number;
  nextLevelTargetXp: number;
  aiGenerationsToday?: number;
  aiGenerationsResetAt?: string | null;
  streakStatus?: "active" | "ember";
  emberDeadline?: string | Date | null;
  preStreakValue?: number | null;
  lastRedemptionAt?: string | Date | null;
}

export default function DashboardClient() {
  const { data: session } = useSession();

  const [character, setCharacter] = useState<CharacterProfile | null>(null);
  const [quests, setQuests] = useState<IQuest[]>([]);
  const [questlines, setQuestlines] = useState<QuestlineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [oracleOpen, setOracleOpen] = useState(false);
  const [questlineOpen, setQuestlineOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<IQuest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  const [attributeBump, setAttributeBump] = useState<{
    attribute: string;
    amount: number;
  } | null>(null);

  const redemptionRef = useRef<HTMLDivElement>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      // Check streak status first on mount (lazy evaluate & generate redemption quest if broken)
      await fetch("/api/streak/check").catch(() => null);

      const [charRes, questsRes, questlinesRes] = await Promise.all([
        fetch("/api/user/character"),
        fetch("/api/quests"),
        fetch("/api/questlines"),
      ]);

      if (charRes.ok) {
        const charData = await charRes.json();
        setCharacter(charData.character);
      }

      if (questsRes.ok) {
        const questsData = await questsRes.json();
        setQuests(questsData.quests || []);
      }

      if (questlinesRes.ok) {
        const qlData = await questlinesRes.json();
        setQuestlines(qlData.questlines || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleCompleteQuest(questId: string) {
    if (completingId) return;
    setCompletingId(questId);
    setErrorMessage(null);

    // Look for quest in general list or inside questlines
    let questToComplete = quests.find((q) => String(q._id) === questId);
    if (!questToComplete) {
      for (const ql of questlines) {
        const match = ql.quests.find((q) => String(q._id) === questId);
        if (match) {
          questToComplete = match;
          break;
        }
      }
    }

    try {
      const res = await fetch(`/api/quests/${questId}/complete`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.error ||
            "Quest completion failed. Your progress was not changed. Try again."
        );
        return;
      }

      if (data.attribute && data.attributeXp) {
        setAttributeBump({
          attribute: data.attribute,
          amount: data.attributeXp,
        });
        setTimeout(() => {
          setAttributeBump(null);
        }, 3500);
      }

      setCompletionData({
        questTitle: questToComplete?.title || "Quest",
        leveledUp: Boolean(data.leveledUp),
        previousLevel: data.previousLevel || 1,
        newLevel: data.newLevel || 1,
        xpEarned: data.xpEarned || 0,
        goldEarned: data.goldEarned || 0,
        attribute: data.attribute || "intellect",
        attributeXp: data.attributeXp || 0,
        attributeValue: data.attributeValue || 0,
        currentStreak: data.currentStreak || 0,
        isRedemption: Boolean(data.isRedemption),
        questlineCompleted: Boolean(data.questlineCompleted),
        questlineTitle: data.questlineTitle || null,
      });

      // Optimistically mark as fulfilled
      setQuests((prevQuests) =>
        prevQuests.map((q) =>
          String(q._id) === questId
            ? ({
                ...q,
                completed: true,
                completedAt: new Date(),
              } as IQuest)
            : q
        )
      );

      await fetchData();
    } catch {
      setErrorMessage(
        "Network error while completing quest. Your progress was not changed. Try again."
      );
    } finally {
      setCompletingId(null);
    }
  }

  async function handleDeleteQuest(questId: string) {
    if (!confirm("Are you sure you want to delete this quest?")) return;
    try {
      const res = await fetch(`/api/quests/${questId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showSuccess("Quest removed from active objectives.");
        await fetchData();
      } else {
        setErrorMessage("Failed to delete quest.");
      }
    } catch {
      setErrorMessage("Network error while deleting quest.");
    }
  }

  async function handleSaveQuest(formData: {
    title: string;
    description: string;
    category: string;
    attribute: string;
    difficulty: string;
  }) {
    setActionLoading(true);
    try {
      if (editingQuest) {
        const res = await fetch(`/api/quests/${String(editingQuest._id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update quest");
        }
        showSuccess("Quest modifications sealed.");
      } else {
        const res = await fetch("/api/quests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create quest");
        }
        showSuccess("New quest forged into Command Nexus.");
      }
      await fetchData();
    } finally {
      setActionLoading(false);
    }
  }

  function openCreateModal() {
    setEditingQuest(null);
    setModalOpen(true);
  }

  function openEditModal(quest: IQuest) {
    setEditingQuest(quest);
    setModalOpen(true);
  }

  function scrollToRedemption() {
    redemptionRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-obsidian-950 px-4 py-10 md:px-8 max-w-6xl mx-auto">
        <LoadingSkeleton />
      </main>
    );
  }

  // Filter regular quests vs redemption quest
  const redemptionQuests = quests.filter((q) => q.isRedemption && !q.completed);
  const standaloneQuests = quests.filter((q) => !q.isRedemption && !q.questlineId);

  return (
    <main className="min-h-screen bg-obsidian-950 text-neutral-100 pb-16 bg-arcane-radial bg-rpg-grid">
      <Navigation />

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 space-y-8">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-800 pb-5">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wide text-white">
              COMMAND NEXUS
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              Execute daily operations, master disciplines, and inspect character status
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setQuestlineOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-arcane/40 bg-obsidian-900 hover:bg-obsidian-800 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-200 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane active:scale-[0.98]"
            >
              <Compass className="h-4 w-4 text-arcane-light" aria-hidden="true" />
              <span>FORGE QUESTLINE</span>
            </button>
            <button
              type="button"
              onClick={() => setOracleOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-arcane/50 bg-arcane/20 hover:bg-arcane/30 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-arcane-light shadow-arcane transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane-light active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4 text-arcane-light" aria-hidden="true" />
              <span>CONSULT ORACLE</span>
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-arcane hover:bg-arcane-dark px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-arcane transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane-light active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>FORGE QUEST</span>
            </button>
          </div>
        </div>

        {/* Success Notification Banner */}
        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-300 backdrop-blur-md animate-asc-modal"
          >
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              aria-label="Dismiss confirmation notification"
              className="text-xs text-emerald-400 hover:text-white p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Error Notification Banner */}
        {errorMessage && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm font-medium text-rose-300 backdrop-blur-md"
          >
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              aria-label="Dismiss error notification"
              className="text-xs text-rose-400 hover:text-white p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Task 8: Sacred Ember Forgiveness Banner */}
        {character?.streakStatus === "ember" && (
          <EmberBanner
            emberDeadline={character.emberDeadline || null}
            preStreakValue={character.preStreakValue || null}
            onScrollToRedemption={scrollToRedemption}
          />
        )}

        {/* Character Card HUD */}
        {character && (
          <CharacterCard
            email={character.email || session?.user?.email || "Player"}
            level={character.level}
            xp={character.xp}
            gold={character.gold}
            currentStreak={character.currentStreak}
            currentLevelBaseXp={character.currentLevelBaseXp}
            nextLevelTargetXp={character.nextLevelTargetXp}
          />
        )}

        {/* Attributes HUD */}
        {character?.attributes && (
          <AttributeBar
            attributes={character.attributes}
            recentlyBumped={attributeBump}
          />
        )}

        {/* Featured Redemption Quests */}
        {redemptionQuests.length > 0 && (
          <div ref={redemptionRef} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xs uppercase tracking-widest text-amber-400">
                SACRED REDEMPTION TRIAL
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Rekindle before midnight UTC
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redemptionQuests.map((quest) => (
                <QuestCard
                  key={String(quest._id)}
                  quest={quest}
                  onComplete={handleCompleteQuest}
                  onEdit={openEditModal}
                  onDelete={handleDeleteQuest}
                  isCompleting={completingId === String(quest._id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Task 9: Questline Campaigns Visual Chain */}
        {questlines.length > 0 && (
          <QuestlineChainView
            questlines={questlines}
            onCompleteQuest={handleCompleteQuest}
            completingId={completingId}
          />
        )}

        {/* Quests Section (Standalone Quests) */}
        <section aria-label="Active Quests" className="space-y-4">
          <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
            <div>
              <h2 className="font-display font-bold text-lg tracking-wide text-white">
                ACTIVE OBJECTIVES
              </h2>
              <p className="text-xs text-neutral-400">
                Daily challenges forged to expand your attributes
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {standaloneQuests.filter((q) => !q.completed).length} Pending /{" "}
              {standaloneQuests.length} Total
            </span>
          </div>

          {standaloneQuests.length === 0 ? (
            <EmptyState onCreateClick={openCreateModal} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {standaloneQuests.map((quest) => (
                <QuestCard
                  key={String(quest._id)}
                  quest={quest}
                  onComplete={handleCompleteQuest}
                  onEdit={openEditModal}
                  onDelete={handleDeleteQuest}
                  isCompleting={completingId === String(quest._id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Quest Forge/Edit Modal */}
      <QuestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveQuest}
        initialData={
          editingQuest
            ? {
                id: String(editingQuest._id),
                title: editingQuest.title,
                description: editingQuest.description,
                category: editingQuest.category,
                attribute: editingQuest.attribute,
                difficulty: editingQuest.difficulty,
              }
            : null
        }
        loading={actionLoading}
      />

      {/* Oracle AI Quest Generation Modal */}
      <OracleModal
        isOpen={oracleOpen}
        onClose={() => setOracleOpen(false)}
        onQuestsCreated={async () => {
          showSuccess("Oracle trials bound to your active quest roster.");
          await fetchData();
        }}
        aiGenerationsToday={character?.aiGenerationsToday || 0}
        dailyLimit={5}
      />

      {/* Questline AI Generation & Decompose Modal */}
      <QuestlineModal
        isOpen={questlineOpen}
        onClose={() => setQuestlineOpen(false)}
        onQuestlineCreated={async () => {
          showSuccess("Questline campaign bound to Command Nexus.");
          await fetchData();
        }}
        aiGenerationsToday={character?.aiGenerationsToday || 0}
        dailyLimit={5}
      />

      {/* Quest Completion & Level-Up / Questline Celebration Modal */}
      <CompletionModal
        isOpen={Boolean(completionData)}
        onClose={() => setCompletionData(null)}
        data={completionData}
      />
    </main>
  );
}
