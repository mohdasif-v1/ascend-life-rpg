import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Quest from "@/models/Quest";
import { getGeminiModel, cleanAndParseJson, RedemptionQuestSchema } from "@/lib/ai";
import { getQuestRewards } from "@/lib/rpg";

export const dynamic = "force-dynamic";

/**
 * Helper to generate an AI redemption quest with fallback if AI fails or times out.
 */
async function generateRedemptionQuestData(streakCount: number) {
  const prompt = `You are the keeper of the Sacred Flame in ASCEND, a dark-fantasy life RPG.
A hero has let their sacred flame flicker (missed a day with a ${streakCount}-day streak).
Craft ONE short, urgent, noble Redemption Quest to rekindle the flame before midnight.
Return STRICT JSON:
{
  "title": "Short, compelling quest title (3-70 characters, no emojis)",
  "description": "Tactical, achievable task to reclaim the flame today (10-160 characters)",
  "category": "Discipline",
  "attribute": "discipline",
  "difficulty": "medium"
}
Rules:
1. attribute MUST be "discipline"
2. category MUST be "Discipline"
3. difficulty MUST be "medium"
4. NO emojis anywhere.
5. Strict JSON only.`;

  try {
    const model = getGeminiModel();
    const response = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Redemption quest AI generation timed out")), 9000)
      ),
    ]);

    const rawText = response.response.text();
    const parsed = cleanAndParseJson(rawText);
    const validated = RedemptionQuestSchema.safeParse(parsed);
    if (validated.success) {
      return validated.data;
    }
  } catch (err) {
    console.warn("AI Redemption Quest generation failed, using heroic fallback:", err);
  }

  // Guaranteed fallback so the user is never blocked
  return {
    title: "Rekindle the Ember: Forge Discipline",
    description: "Complete one focused 25-minute deep work or physical session to reclaim your lost continuity.",
    category: "Discipline",
    attribute: "discipline" as const,
    difficulty: "medium" as const,
  };
}

/**
 * GET /api/streak/check
 * Evaluates the user's streak status against the exact calendar-day UTC logic used in lib/rpg.ts.
 * If user missed yesterday (diffDays === 2), has currentStreak >= 2, and no redemption in last 7 days:
 * - transitions user to streakStatus = 'ember'
 * - stores preStreakValue = currentStreak
 * - sets emberDeadline to end of today UTC (23:59:59.999Z)
 * - creates 1 redemption quest expiring at emberDeadline
 * If emberDeadline has passed without completing redemption:
 * - resets streak to 0/1 and restores status to 'active'
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const nowDateStr = now.toISOString().slice(0, 10);
    let userModified = false;

    // 1. Handle expired ember window if user failed to redeem in time
    if (user.streakStatus === "ember" && user.emberDeadline && now > new Date(user.emberDeadline)) {
      // Check if they completed a redemption quest before expiry
      const activeRedemptionQuest = await Quest.findOne({
        userId: user._id,
        isRedemption: true,
        completed: false,
      });

      if (activeRedemptionQuest) {
        // Expire the uncompleted quest
        activeRedemptionQuest.completed = true; // close it so it disappears or mark as abandoned
        await activeRedemptionQuest.deleteOne();
      }

      // Fall through to regular streak break: reset to 0 or 1
      user.streakStatus = "active";
      user.currentStreak = 0;
      user.preStreakValue = null;
      user.emberDeadline = null;
      userModified = true;
    }

    // 2. Evaluate streak break if currently 'active'
    if (user.streakStatus === "active" && user.lastActivityDate) {
      const lastDateStr = new Date(user.lastActivityDate).toISOString().slice(0, 10);

      if (nowDateStr !== lastDateStr) {
        const nowDate = new Date(nowDateStr);
        const lastDate = new Date(lastDateStr);
        const diffDays = Math.round((nowDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        // diffDays === 1 means they were active yesterday (streak still valid today, awaiting today's quest)
        // diffDays === 2 means they missed yesterday entirely (candidate for Redemption!)
        if (diffDays === 2 && (user.currentStreak || 0) >= 2) {
          // Check 7-day abuse guard: lastRedemptionAt
          const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
          const eligibleForRedemption =
            !user.lastRedemptionAt ||
            now.getTime() - new Date(user.lastRedemptionAt).getTime() >= sevenDaysMs;

          if (eligibleForRedemption) {
            // End of today UTC: 23:59:59.999Z
            const emberDeadline = new Date(nowDateStr + "T23:59:59.999Z");

            user.streakStatus = "ember";
            user.preStreakValue = user.currentStreak;
            user.emberDeadline = emberDeadline;
            user.lastRedemptionAt = now;
            userModified = true;

            // Generate Redemption Quest
            const questData = await generateRedemptionQuestData(user.currentStreak);
            const rewards = getQuestRewards(questData.difficulty);

            // Ensure no duplicate active redemption quest exists
            await Quest.deleteMany({
              userId: user._id,
              isRedemption: true,
              completed: false,
            });

            await Quest.create({
              title: questData.title,
              description: questData.description,
              category: questData.category,
              attribute: questData.attribute,
              difficulty: questData.difficulty,
              xpReward: rewards.xpReward + 25, // Small redemption courage bonus
              goldReward: rewards.goldReward + 15,
              completed: false,
              userId: user._id,
              source: "ai",
              isRedemption: true,
              expiresAt: emberDeadline,
            });
          } else {
            // Missed yesterday but already redeemed within the last 7 days -> Normal streak reset
            user.currentStreak = 0;
            userModified = true;
          }
        } else if (diffDays > 2) {
          // Gap of more than 1 missed day: too distant for single-day redemption
          if (user.currentStreak > 0) {
            user.currentStreak = 0;
            userModified = true;
          }
        }
      }
    }

    if (userModified) {
      await user.save();
    }

    // Check if there is an active redemption quest
    const redemptionQuest = await Quest.findOne({
      userId: user._id,
      isRedemption: true,
      completed: false,
    }).lean();

    return NextResponse.json({
      success: true,
      streakStatus: user.streakStatus,
      currentStreak: user.currentStreak,
      preStreakValue: user.preStreakValue,
      emberDeadline: user.emberDeadline,
      redemptionQuest: redemptionQuest || null,
    });
  } catch (error) {
    console.error("GET /api/streak/check error:", error);
    return NextResponse.json({ error: "Failed to verify streak continuity" }, { status: 500 });
  }
}
