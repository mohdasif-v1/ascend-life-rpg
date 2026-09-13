import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import {
  DAILY_AI_LIMIT,
  QuestDraftsArraySchema,
  cleanAndParseJson,
  getGeminiModel,
  ValidatedQuestDraft,
} from "@/lib/ai";
import { getQuestRewards } from "@/lib/rpg";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to consult the Oracle." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { goal } = body;

    if (!goal || typeof goal !== "string" || !goal.trim()) {
      return NextResponse.json(
        { error: "Please provide a real objective or task for the Oracle to forge." },
        { status: 400 }
      );
    }

    if (goal.trim().length > 500) {
      return NextResponse.json(
        { error: "Objective is too extensive. Please keep it under 500 characters." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: "Player profile not found." },
        { status: 404 }
      );
    }

    // Rate limiting check & reset logic
    const now = new Date();
    const resetAt = user.aiGenerationsResetAt ? new Date(user.aiGenerationsResetAt) : null;

    if (!resetAt || now > resetAt) {
      // Initialize or reset 24-hour cycle
      const nextReset = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      user.aiGenerationsToday = 0;
      user.aiGenerationsResetAt = nextReset;
    }

    if (user.aiGenerationsToday >= DAILY_AI_LIMIT) {
      const resetTimeStr = user.aiGenerationsResetAt
        ? new Date(user.aiGenerationsResetAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "tomorrow";
      return NextResponse.json(
        {
          error: `The Oracle's energy is depleted for today (${DAILY_AI_LIMIT}/${DAILY_AI_LIMIT} used). Power restores at ${resetTimeStr}.`,
          limitReached: true,
          remaining: 0,
          resetAt: user.aiGenerationsResetAt,
        },
        { status: 429 }
      );
    }

    // Prompt construction
    const prompt = `You are the mystical Oracle of ASCEND, a dark-fantasy life RPG progression system.
A player brings you their real-life goal: "${goal.trim()}".

Break down this real-life goal into 2 to 3 distinct, actionable, achievable RPG quest drafts.
Each quest MUST conform to this exact JSON schema:
[
  {
    "title": "Short, compelling quest title (3-70 characters, no emojis)",
    "description": "Clear tactical instruction for completing the quest (10-180 characters)",
    "category": "One of: Coding, Study, Fitness, Health, Mindfulness, Discipline, or Work",
    "attribute": "Exactly one of: strength, intellect, vitality, focus, discipline",
    "difficulty": "Exactly one of: easy, medium, hard, epic"
  }
]

RULES:
1. Do NOT invent new attributes. ONLY use: strength, intellect, vitality, focus, discipline.
2. Do NOT use emojis anywhere in titles or descriptions.
3. Return STRICT JSON array only. No markdown formatting, no commentary.`;

    let model;
    try {
      model = getGeminiModel();
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || "AI Oracle is unavailable. Check server configuration." },
        { status: 503 }
      );
    }

    let rawText = "";
    let parsed: any;
    let validatedResult: any;

    // Call 1 with timeout safeguard
    try {
      const response = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Oracle divination timed out.")), 15000)
        ),
      ]);
      rawText = response.response.text();
      parsed = cleanAndParseJson(rawText);
      validatedResult = QuestDraftsArraySchema.safeParse(parsed);
    } catch (firstErr: any) {
      console.warn("Oracle call 1 failed or malformed, attempting retry with stricter instruction:", firstErr);
    }

    // Retry once if validation failed or parsing threw
    if (!validatedResult || !validatedResult.success) {
      try {
        const strictPrompt = `${prompt}\n\nCRITICAL: Previous attempt was invalid. Return ONLY a valid JSON array of quest objects.`;
        const responseRetry = await Promise.race([
          model.generateContent(strictPrompt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Oracle retry timed out.")), 15000)
          ),
        ]);
        rawText = responseRetry.response.text();
        parsed = cleanAndParseJson(rawText);
        validatedResult = QuestDraftsArraySchema.safeParse(parsed);
      } catch (retryErr: any) {
        console.error("Oracle call 2 (retry) also failed:", retryErr);
      }
    }

    if (!validatedResult || !validatedResult.success) {
      return NextResponse.json(
        {
          error: "The Oracle was unable to divine clear quests from that vision. Please rephrase your objective and try again.",
        },
        { status: 502 }
      );
    }

    // Successful divination: Increment rate limit and persist
    user.aiGenerationsToday = (user.aiGenerationsToday || 0) + 1;
    await user.save();

    // Server authoritatively derives rewards based on difficulty
    const drafts: ValidatedQuestDraft[] = validatedResult.data.map((d: any) => {
      const rewards = getQuestRewards(d.difficulty);
      return {
        title: d.title,
        description: d.description || "",
        category: d.category,
        attribute: d.attribute,
        difficulty: d.difficulty,
        xpReward: rewards.xpReward,
        goldReward: rewards.goldReward,
      };
    });

    return NextResponse.json(
      {
        success: true,
        drafts,
        remainingGenerations: DAILY_AI_LIMIT - user.aiGenerationsToday,
        resetAt: user.aiGenerationsResetAt,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/quests/generate unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected disturbance interrupted the Oracle. Please try again." },
      { status: 500 }
    );
  }
}
