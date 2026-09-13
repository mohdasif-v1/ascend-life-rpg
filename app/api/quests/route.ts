import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Quest, { QuestDifficulty, RPGAttribute } from "@/models/Quest";
import {
  getQuestRewards,
  VALID_ATTRIBUTES,
  VALID_DIFFICULTIES,
} from "@/lib/rpg";

// GET /api/quests - List authenticated user's quests (newest first)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const quests = await Quest.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, quests }, { status: 200 });
  } catch (error) {
    console.error("GET /api/quests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quests" },
      { status: 500 }
    );
  }
}

// POST /api/quests - Create a new quest for the authenticated user
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, category, attribute, difficulty, source } = body;

    // Validate title
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required and cannot be empty." },
        { status: 400 }
      );
    }

    // Validate category
    if (!category || typeof category !== "string" || !category.trim()) {
      return NextResponse.json(
        { error: "Category is required." },
        { status: 400 }
      );
    }

    // Validate attribute
    if (!attribute || !VALID_ATTRIBUTES.includes(attribute as RPGAttribute)) {
      return NextResponse.json(
        {
          error: `Attribute must be one of: ${VALID_ATTRIBUTES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate difficulty (default to easy if not provided)
    const validDifficulty: QuestDifficulty = VALID_DIFFICULTIES.includes(
      difficulty as QuestDifficulty
    )
      ? (difficulty as QuestDifficulty)
      : "easy";

    // Validate source ('manual' or 'ai')
    const validSource: "manual" | "ai" = source === "ai" ? "ai" : "manual";

    // Authoritative server-side reward derivation
    const rewards = getQuestRewards(validDifficulty);

    await connectToDatabase();

    const newQuest = await Quest.create({
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
      category: category.trim(),
      attribute: attribute as RPGAttribute,
      difficulty: validDifficulty,
      xpReward: rewards.xpReward,
      goldReward: rewards.goldReward,
      completed: false,
      userId: session.user.id,
      source: validSource,
    });

    return NextResponse.json(
      { success: true, quest: newQuest },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/quests error:", error);
    return NextResponse.json(
      { error: "Failed to create quest" },
      { status: 500 }
    );
  }
}
