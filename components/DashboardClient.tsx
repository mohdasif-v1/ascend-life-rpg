"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import CharacterCard from "@/components/CharacterCard";
import AttributeBar from "@/components/AttributeBar";
import QuestCard from "@/components/QuestCard";
import QuestModal from "@/components/QuestModal";
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
}

export default function DashboardClient() {
  const { data: session } = useSession();

  const [character, setCharacter] = useState<CharacterProfile | null>(null);
  const [quests, setQuests] = useState<IQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<IQuest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  const [attributeBump, setAttributeBump] = useState<{
    attribute: string;
    amount: number;
  } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [charRes, questsRes] = await Promise.all([
        fetch("/api/user/character"),
        fetch("/api/quests"),
      ]);

      if (charRes.ok) {
        const charData = await charRes.json();
        setCharacter(charData.character);
      }

      if (questsRes.ok) {
        const questsData = await questsRes.json();
        setQuests(questsData.quests || []);
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

  // Complete Quest Handler: Authoritative Server Reconciliation
  async function handleCompleteQuest(questId: string) {
    if (completingId) return; // Prevent duplicate rapid clicks
    setCompletingId(questId);
    setErrorMessage(null);

    // Find current quest title for celebration modal
    const questToComplete = quests.find((q) => String(q._id) === questId);

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

      // Authoritative Server Response received:
      // data: { success, leveledUp, previousLevel, newLevel, xp, xpEarned, gold, goldEarned, attribute, attributeValue, attributeXp, currentStreak, longestStreak }

      // 1. Trigger Attribute Bump
      if (data.attribute && data.attributeXp) {
        setAttributeBump({
          attribute: data.attribute,
          amount: data.attributeXp,
        });
        setTimeout(() => {
          setAttributeBump(null);
        }, 3500);
      }

      // 2. Open Completion/Celebration Modal with real server values
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
      });

      // 3. Mark quest as completed immediately in local list from authoritative success
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

      // 4. Reconcile character stats from server-authoritative response
      await fetchData();
    } catch {
      setErrorMessage(
        "Network error while completing quest. Your progress was not changed. Try again."
      );
    } finally {
      setCompletingId(null);
    }
  }

  // Delete Quest Handler
  async function handleDeleteQuest(questId: string) {
    if (!confirm("Are you sure you want to delete this quest?")) return;
    try {
      const res = await fetch(`/api/quests/${questId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchData();
      } else {
        setErrorMessage("Failed to delete quest.");
      }
    } catch {
      setErrorMessage("Network error while deleting quest.");
    }
  }

  // Save (Create or Edit) Quest Handler
  async function handleSaveQuest(formData: {
    title: string;
    description: string;
    category: string;
    attribute: string;
    difficulty: string;
  }) {
    setActionLoading(true);
    setErrorMessage(null);
    try {
      if (editingQuest) {
        // PATCH
        const res = await fetch(`/api/quests/${String(editingQuest._id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update quest");
        }
      } else {
        // POST
        const res = await fetch("/api/quests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create quest");
        }
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0c] px-4 py-10 md:px-8 max-w-6xl mx-auto">
        <LoadingSkeleton />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-neutral-100 pb-16">
      {/* Top Navigation Bar */}
      <Navigation />

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 space-y-8">
        {/* Action Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Command Nexus
            </h2>
            <p className="text-xs text-neutral-400">
              Manage real-life quests and track character progression
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="self-start sm:self-auto rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            + Forge New Quest
          </button>
        </div>
        {/* Error Notification Banner */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-sm font-medium text-rose-300 backdrop-blur-md"
          >
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              aria-label="Dismiss error"
              className="text-xs text-rose-400 hover:text-white"
            >
              ✕
            </button>
          </div>
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

        {/* Attributes HUD with dynamic bump indication */}
        {character?.attributes && (
          <AttributeBar
            attributes={character.attributes}
            recentlyBumped={attributeBump}
          />
        )}

        {/* Quests Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Today&apos;s Quests
              </h2>
              <p className="text-xs text-neutral-400">
                Execute daily challenges to forge your character
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {quests.filter((q) => !q.completed).length} Active /{" "}
              {quests.length} Total
            </span>
          </div>

          {quests.length === 0 ? (
            <EmptyState onCreateClick={openCreateModal} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quests.map((quest) => (
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

      {/* Quest Completion & Level-Up Celebration Modal */}
      <CompletionModal
        isOpen={Boolean(completionData)}
        onClose={() => setCompletionData(null)}
        data={completionData}
      />
    </main>
  );
}
