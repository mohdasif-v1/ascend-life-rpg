import { QuestDifficulty, RPGAttribute } from "@/models/Quest";

export const VALID_ATTRIBUTES: RPGAttribute[] = [
  "strength",
  "intellect",
  "vitality",
  "focus",
  "discipline",
];

export const VALID_DIFFICULTIES: QuestDifficulty[] = [
  "easy",
  "medium",
  "hard",
  "epic",
];

export interface QuestReward {
  xpReward: number;
  goldReward: number;
  attributeXp: number;
}

export const DIFFICULTY_REWARDS: Record<QuestDifficulty, QuestReward> = {
  easy: { xpReward: 50, goldReward: 25, attributeXp: 5 },
  medium: { xpReward: 80, goldReward: 40, attributeXp: 10 },
  hard: { xpReward: 120, goldReward: 60, attributeXp: 18 },
  epic: { xpReward: 200, goldReward: 100, attributeXp: 30 },
};

export function getQuestRewards(difficulty: QuestDifficulty): QuestReward {
  return DIFFICULTY_REWARDS[difficulty] || DIFFICULTY_REWARDS.easy;
}

/**
 * Authoritative XP required to reach a specific level.
 * Explicitly required non-linear formula: Math.floor(100 * Math.pow(level, 1.5))
 */
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculate level based on cumulative total XP.
 */
export function getLevel(totalXp: number): number {
  let level = 1;
  while (totalXp >= xpForLevel(level + 1)) {
    level++;
  }
  return level;
}

/**
 * Calendar-day streak comparison utility.
 * Compares date strings in YYYY-MM-DD format (UTC) to avoid timezone/raw millisecond drift.
 */
export function calculateNewStreak(
  lastActivityDate: Date | null,
  currentStreak: number,
  longestStreak: number,
  now: Date = new Date()
): { currentStreak: number; longestStreak: number; lastActivityDate: Date } {
  if (!lastActivityDate) {
    const updatedStreak = 1;
    return {
      currentStreak: updatedStreak,
      longestStreak: Math.max(longestStreak, updatedStreak),
      lastActivityDate: now,
    };
  }

  const nowDateStr = now.toISOString().slice(0, 10);
  const lastDateStr = new Date(lastActivityDate).toISOString().slice(0, 10);

  if (nowDateStr === lastDateStr) {
    // Same calendar day: streak unchanged
    return {
      currentStreak,
      longestStreak,
      lastActivityDate: now,
    };
  }

  // Calculate day difference
  const nowDate = new Date(nowDateStr);
  const lastDate = new Date(lastDateStr);
  const diffTime = nowDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Exactly yesterday: increment streak
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      lastActivityDate: now,
    };
  } else {
    // Gap of more than 1 day: reset streak to 1
    const newStreak = 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      lastActivityDate: now,
    };
  }
}
