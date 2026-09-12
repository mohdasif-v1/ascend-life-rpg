"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import CharacterCard from "@/components/CharacterCard";
import AttributeBar from "@/components/AttributeBar";
import QuestCard from "@/components/QuestCard";
import QuestModal from "@/components/QuestModal";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";
import LogoutButton from "@/components/LogoutButton";
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
  const [notification, setNotification] = useState<string | null>(null);

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

  // Complete Quest Handler
  async function handleCompleteQuest(questId: string) {
    if (completingId) return;
    setCompletingId(questId);
    try {
      const res = await fetch(`/api/quests/${questId}/complete`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setNotification(data.error || "Failed to complete quest.");
        return;
      }

      if (data.leveledUp) {
        setNotification(`⭐ LEVEL UP! You ascended to Level ${data.newLevel}!`);
      } else {
        setNotification(`✓ Conquered! Gained ${data.xpEarned} XP & ${data.goldEarned} Gold.`);
      }

      // Re-fetch authoritative character and quest data
      await fetchData();
    } catch {
      setNotification("Network error while completing quest.");
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
        setNotification("Quest removed.");
        await fetchData();
      }
    } catch {
      setNotification("Failed to delete quest.");
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
        setNotification("Quest updated.");
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
        setNotification("New quest forged.");
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
      <header className="sticky top-0 z-30 border-b border-neutral-800/80 bg-[#0a0a0c]/80 backdrop-blur-md px-4 py-3.5 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              ASCEND
            </h1>
            <span className="hidden sm:inline-block rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
              LIFE RPG
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              + Forge Quest
            </button>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 space-y-8">
        {/* Notification Banner */}
        {notification && (
          <div
            role="status"
            className="flex items-center justify-between rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-3.5 text-sm font-medium text-indigo-200 backdrop-blur-md"
          >
            <span>{notification}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-xs text-neutral-400 hover:text-white"
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

        {/* Attributes HUD */}
        {character?.attributes && (
          <AttributeBar attributes={character.attributes} />
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

      {/* Quest Modal */}
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
    </main>
  );
}
