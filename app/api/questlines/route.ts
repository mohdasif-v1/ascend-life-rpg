import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Questline from "@/models/Questline";
import Quest, { QuestDifficulty, RPGAttribute } from "@/models/Quest";
import { getQuestRewards, VALID_ATTRIBUTES, VALID_DIFFICULTIES } from "@/lib/rpg";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Input schema for confirming and creating a questline
const CreateQuestlineInputSchema = z.object({
  title: z.string().min(3).max(100),
  goal: z.string().min(3).max(600),
  steps: z
    .array(
      z.object({
        title: z.string().min(3).max(100),
        description: z.string().max(250).default(""),
        category: z.string().min(2).max(40),
        attribute: z.enum([
          "strength",
          "intellect",
          "vitality",
          "focus",
          "discipline",
        ] as [RPGAttribute, ...RPGAttribute[]]),
        difficulty: z.enum(["easy", "medium", "hard", "epic"] as [
          QuestDifficulty,
          ...QuestDifficulty[]
        ]),
      })
    )
    .min(1)
    .max(10),
});

// GET /api/questlines - Return user's active questlines along with their quests
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const questlines = await Questline.find({
      userId: session.user.id,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .lean();

    const questlineIds = questlines.map((q) => q._id);

    const quests = await Quest.find({
      userId: session.user.id,
      questlineId: { $in: questlineIds },
    })
      .sort({ order: 1 })
      .lean();

    // Group quests by questlineId
    const questlinesWithQuests = questlines.map((ql) => {
      const qlQuests = quests.filter(
        (q) => q.questlineId && q.questlineId.toString() === ql._id.toString()
      );
      return {
        ...ql,
        quests: qlQuests,
      };
    });

    return NextResponse.json({ success: true, questlines: questlinesWithQuests }, { status: 200 });
  } catch (error) {
    console.error("GET /api/questlines error:", error);
    return NextResponse.json({ error: "Failed to fetch questlines" }, { status: 500 });
  }
}

// POST /api/questlines - Confirm draft and create Questline + sequential Quests
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = CreateQuestlineInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid questline payload.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, goal, steps } = parsed.data;

    await connectToDatabase();

    // 1. Create Questline document
    const questline = await Questline.create({
      userId: session.user.id,
      title: title.trim(),
      goal: goal.trim(),
      status: "active",
    });

    // 2. Create sequential Quest documents
    // Step 0 is unlocked (locked: false); all subsequent steps (index > 0) are locked (locked: true)
    const questDocs = steps.map((step, index) => {
      const validDiff = VALID_DIFFICULTIES.includes(step.difficulty)
        ? step.difficulty
        : "easy";
      const validAttr = VALID_ATTRIBUTES.includes(step.attribute)
        ? step.attribute
        : "discipline";
      const rewards = getQuestRewards(validDiff);

      return {
        userId: session.user.id,
        title: step.title.trim(),
        description: step.description.trim(),
        category: step.category.trim(),
        attribute: validAttr,
        difficulty: validDiff,
        xpReward: rewards.xpReward,
        goldReward: rewards.goldReward,
        completed: false,
        source: "ai" as const,
        questlineId: questline._id,
        order: index,
        locked: index > 0, // Enforce locked ordering on steps after first
      };
    });

    const createdQuests = await Quest.insertMany(questDocs);

    return NextResponse.json(
      {
        success: true,
        questline: {
          ...questline.toObject(),
          quests: createdQuests,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/questlines error:", error);
    return NextResponse.json(
      { error: "Failed to instantiate questline campaign." },
      { status: 500 }
    );
  }
}
