import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import {
  DAILY_AI_LIMIT,
  QuestlineDraftArraySchema,
  cleanAndParseJson,
  getGeminiModel,
  ValidatedQuestlineStepDraft,
} from "@/lib/ai";
import { getQuestRewards } from "@/lib/rpg";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Structured schema expected from Gemini for questline decomposition
const QuestlineGeminiSchema = z.object({
  title: z.string().min(3).max(80),
  steps: QuestlineDraftArraySchema,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to forge a Questline." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { goal } = body;

    if (!goal || typeof goal !== "string" || !goal.trim()) {
      return NextResponse.json(
        { error: "Please provide a grand objective or campaign goal to decompose." },
        { status: 400 }
      );
    }

    if (goal.trim().length > 600) {
      return NextResponse.json(
        { error: "Campaign goal is too lengthy. Keep it under 600 characters." },
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

    // Shared AI daily rate limiting
    const now = new Date();
    const resetAt = user.aiGenerationsResetAt ? new Date(user.aiGenerationsResetAt) : null;

    if (!resetAt || now > resetAt) {
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
          error: `Your daily AI energy is depleted (${DAILY_AI_LIMIT}/${DAILY_AI_LIMIT} used). Power restores at ${resetTimeStr}.`,
          limitReached: true,
          remaining: 0,
          resetAt: user.aiGenerationsResetAt,
        },
        { status: 429 }
      );
    }

    const prompt = `You are the Grand Cartographer & Questmaster of ASCEND, a dark-fantasy life RPG.
A player brings you a major long-term objective: "${goal.trim()}".

Decompose this major goal into an ordered, escalating chain of 3 to 5 distinct quest steps (Questline).
The steps MUST progress logically from beginner/foundational preparation to climactic mastery.
Difficulty MUST escalate sequentially across the steps (e.g. easy -> medium -> hard -> epic).

Return STRICT JSON matching this structure:
{
  "title": "Epic Campaign Title for this Questline (3-70 characters, no emojis)",
  "steps": [
    {
      "title": "Clear tactical step title (3-70 characters, no emojis)",
      "description": "Tactical action required to complete this step (10-180 characters)",
      "category": "One of: Coding, Study, Fitness, Health, Mindfulness, Discipline, Work",
      "attribute": "Exactly one of: strength, intellect, vitality, focus, discipline",
      "difficulty": "One of: easy, medium, hard, epic"
    }
  ]
}

RULES:
1. ONLY use valid attributes: strength, intellect, vitality, focus, discipline.
2. Escalating difficulty: earlier steps MUST be easier than later steps.
3. NO emojis anywhere.
4. Return STRICT JSON only, no markdown wrapper or conversational comments.`;

    let model;
    try {
      model = getGeminiModel();
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || "AI service is unavailable. Check server configuration." },
        { status: 503 }
      );
    }

    let parsedResult: z.infer<typeof QuestlineGeminiSchema> | null = null;

    // Call 1 with timeout safeguard
    try {
      const response = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Questline generation timed out after 12s")), 12000)
        ),
      ]);

      const rawText = response.response.text();
      const parsed = cleanAndParseJson(rawText);
      const validated = QuestlineGeminiSchema.safeParse(parsed);
      if (validated.success) {
        parsedResult = validated.data;
      } else {
        console.warn("Call 1 schema validation failed:", validated.error.flatten());
      }
    } catch (call1Err) {
      console.warn("Call 1 failed, initiating retry:", call1Err);
    }

    // Call 2 retry if needed
    if (!parsedResult) {
      try {
        const retryPrompt = `${prompt}\n\nIMPORTANT: Strictly output valid JSON matching the schema. No markdown formatting.`;
        const response2 = await Promise.race([
          model.generateContent(retryPrompt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Questline retry timed out")), 12000)
          ),
        ]);

        const rawText2 = response2.response.text();
        const parsed2 = cleanAndParseJson(rawText2);
        const validated2 = QuestlineGeminiSchema.safeParse(parsed2);
        if (validated2.success) {
          parsedResult = validated2.data;
        } else {
          console.error("Call 2 schema validation failed:", validated2.error.flatten());
        }
      } catch (call2Err) {
        console.error("Call 2 retry error:", call2Err);
      }
    }

    if (!parsedResult) {
      return NextResponse.json(
        { error: "Failed to forge a structured questline from your objective. Please rephrase your goal." },
        { status: 500 }
      );
    }

    // Increment AI rate limit counter
    user.aiGenerationsToday = (user.aiGenerationsToday || 0) + 1;
    await user.save();

    // Attach rewards and order indexing to drafts
    const stepsWithRewards: ValidatedQuestlineStepDraft[] = parsedResult.steps.map((step, idx) => {
      const rewards = getQuestRewards(step.difficulty);
      return {
        ...step,
        order: idx,
        xpReward: rewards.xpReward,
        goldReward: rewards.goldReward,
      };
    });

    const remainingGenerations = Math.max(0, DAILY_AI_LIMIT - user.aiGenerationsToday);

    return NextResponse.json(
      {
        success: true,
        title: parsedResult.title,
        goal: goal.trim(),
        steps: stepsWithRewards,
        remainingGenerations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/questlines/generate error:", error);
    return NextResponse.json(
      { error: "Failed to forge questline due to internal server error." },
      { status: 500 }
    );
  }
}
