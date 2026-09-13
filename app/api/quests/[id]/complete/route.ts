import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isValidObjectId } from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Quest from "@/models/Quest";
import User from "@/models/User";
import Questline from "@/models/Questline";
import QuestCompletion from "@/models/QuestCompletion";
import {
  calculateNewStreak,
  getLevel,
  getQuestRewards,
} from "@/lib/rpg";

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/quests/:id/complete - Authoritatively complete a quest with atomic double-completion protection
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const questId = params.id;
    if (!isValidObjectId(questId)) {
      return NextResponse.json({ error: "Invalid quest ID" }, { status: 400 });
    }

    await connectToDatabase();

    // First, verify quest ownership and status
    const quest = await Quest.findById(questId);
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    if (quest.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this quest" },
        { status: 403 }
      );
    }

    // Task 7: Reject completion if quest is locked in a questline sequence
    if (quest.locked) {
      return NextResponse.json(
        { error: "Forbidden: This quest is locked. Complete the prior quests in the questline first." },
        { status: 403 }
      );
    }

    if (quest.completed) {
      return NextResponse.json(
        { error: "Quest is already completed" },
        { status: 409 }
      );
    }

    const now = new Date();

    // If it's a redemption quest, verify it hasn't expired
    if (quest.isRedemption && quest.expiresAt && now > new Date(quest.expiresAt)) {
      return NextResponse.json(
        { error: "This redemption quest has expired. The ember has gone cold." },
        { status: 410 }
      );
    }

    // CRITICAL: Atomic transition incomplete -> complete to prevent race conditions / double-completion
    const updatedQuest = await Quest.findOneAndUpdate(
      {
        _id: questId,
        userId: session.user.id,
        completed: false,
        locked: { $ne: true },
      },
      {
        $set: {
          completed: true,
          completedAt: now,
        },
      },
      { new: true }
    );

    if (!updatedQuest) {
      return NextResponse.json(
        { error: "Quest was already completed, locked, or concurrently modified" },
        { status: 409 }
      );
    }

    // Server-authoritative rewards directly from DB record
    let xpReward = updatedQuest.xpReward;
    let goldReward = updatedQuest.goldReward;
    const attribute = updatedQuest.attribute;
    const attributeXp = getQuestRewards(updatedQuest.difficulty).attributeXp;

    // Load user to perform authoritative progression calculations
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle Questline progression & final step bonus
    let questlineUnlockedNext = false;
    let questlineCompleted = false;
    let questlineTitle: string | null = null;

    if (updatedQuest.questlineId && typeof updatedQuest.order === "number") {
      // Find the next step in this questline
      const nextQuest = await Quest.findOne({
        questlineId: updatedQuest.questlineId,
        order: updatedQuest.order + 1,
      });

      if (nextQuest) {
        // Unlock next step
        nextQuest.locked = false;
        await nextQuest.save();
        questlineUnlockedNext = true;
      } else {
        // No further steps -> Questline completed!
        const ql = await Questline.findOneAndUpdate(
          { _id: updatedQuest.questlineId, userId: session.user.id },
          { $set: { status: "completed" } },
          { new: true }
        );
        if (ql) {
          questlineCompleted = true;
          questlineTitle = ql.title;
          // Grand Questline Completion Bonus: +200 XP and +100 Gold!
          xpReward += 200;
          goldReward += 100;
        }
      }
    }

    // Previous state
    const previousLevel = user.level || 1;
    const previousXp = user.xp || 0;
    const previousGold = user.gold || 0;

    // Ensure embedded attributes exist
    if (!user.attributes) {
      user.attributes = {
        strength: 0,
        intellect: 0,
        vitality: 0,
        focus: 0,
        discipline: 0,
      };
    }

    // New XP and level calculations
    const newXp = previousXp + xpReward;
    const newLevel = getLevel(newXp);
    const leveledUp = newLevel > previousLevel;
    const newGold = previousGold + goldReward;

    // Attribute progression
    user.attributes[attribute] = (user.attributes[attribute] || 0) + attributeXp;

    // Streak calculations:
    // Task 4: Redemption Quest completion restores streak to preStreakValue + 1
    let newStreak = user.currentStreak || 0;
    let newLongestStreak = user.longestStreak || 0;

    if (updatedQuest.isRedemption) {
      const restoredStreak = (user.preStreakValue || user.currentStreak || 0) + 1;
      newStreak = restoredStreak;
      newLongestStreak = Math.max(newLongestStreak, restoredStreak);
      user.currentStreak = newStreak;
      user.longestStreak = newLongestStreak;
      user.streakStatus = "active";
      user.preStreakValue = null;
      user.emberDeadline = null;
      user.lastActivityDate = now;
    } else {
      const streakResult = calculateNewStreak(
        user.lastActivityDate,
        user.currentStreak || 0,
        user.longestStreak || 0,
        now
      );
      user.currentStreak = streakResult.currentStreak;
      user.longestStreak = streakResult.longestStreak;
      user.lastActivityDate = streakResult.lastActivityDate;
      // If user completes any regular quest while in ember mode before deadline, clear ember
      if (user.streakStatus === "ember") {
        user.streakStatus = "active";
        user.emberDeadline = null;
        user.preStreakValue = null;
      }
    }

    // Save updated user state
    user.xp = newXp;
    user.level = newLevel;
    user.gold = newGold;

    await user.save();

    // Create QuestCompletion historical audit record
    await QuestCompletion.create({
      questId: updatedQuest._id,
      userId: user._id,
      xpEarned: xpReward,
      goldEarned: goldReward,
      attribute,
      attributeXp,
      completedAt: now,
    });

    return NextResponse.json(
      {
        success: true,
        leveledUp,
        previousLevel,
        newLevel,
        xp: newXp,
        xpEarned: xpReward,
        gold: newGold,
        goldEarned: goldReward,
        attribute,
        attributeValue: user.attributes[attribute],
        attributeXp,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        completedAt: now,
        isRedemption: updatedQuest.isRedemption,
        questlineUnlockedNext,
        questlineCompleted,
        questlineTitle,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/quests/:id/complete error:", error);
    return NextResponse.json(
      { error: "Failed to complete quest" },
      { status: 500 }
    );
  }
}

