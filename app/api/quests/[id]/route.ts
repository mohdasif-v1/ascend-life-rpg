import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isValidObjectId } from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Quest, { QuestDifficulty, RPGAttribute } from "@/models/Quest";
import {
  getQuestRewards,
  VALID_ATTRIBUTES,
  VALID_DIFFICULTIES,
} from "@/lib/rpg";

interface RouteParams {
  params: {
    id: string;
  };
}

// PATCH /api/quests/:id - Update an uncompleted quest owned by the user
export async function PATCH(req: Request, { params }: RouteParams) {
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

    const quest = await Quest.findById(questId);
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    // Ownership check
    if (quest.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this quest" },
        { status: 403 }
      );
    }

    if (quest.completed) {
      return NextResponse.json(
        { error: "Completed quests cannot be modified" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, description, category, attribute, difficulty } = body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return NextResponse.json(
          { error: "Title cannot be empty" },
          { status: 400 }
        );
      }
      quest.title = title.trim();
    }

    if (description !== undefined) {
      quest.description = typeof description === "string" ? description.trim() : "";
    }

    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        return NextResponse.json(
          { error: "Category cannot be empty" },
          { status: 400 }
        );
      }
      quest.category = category.trim();
    }

    if (attribute !== undefined) {
      if (!VALID_ATTRIBUTES.includes(attribute as RPGAttribute)) {
        return NextResponse.json(
          { error: `Invalid attribute: ${attribute}` },
          { status: 400 }
        );
      }
      quest.attribute = attribute as RPGAttribute;
    }

    if (difficulty !== undefined) {
      if (!VALID_DIFFICULTIES.includes(difficulty as QuestDifficulty)) {
        return NextResponse.json(
          { error: `Invalid difficulty: ${difficulty}` },
          { status: 400 }
        );
      }
      quest.difficulty = difficulty as QuestDifficulty;
      // Server-authoritative recalculation of rewards when difficulty changes
      const newRewards = getQuestRewards(quest.difficulty);
      quest.xpReward = newRewards.xpReward;
      quest.goldReward = newRewards.goldReward;
    }

    await quest.save();

    return NextResponse.json({ success: true, quest }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/quests/:id error:", error);
    return NextResponse.json(
      { error: "Failed to update quest" },
      { status: 500 }
    );
  }
}

// DELETE /api/quests/:id - Delete a quest owned by the user
export async function DELETE(req: Request, { params }: RouteParams) {
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

    const quest = await Quest.findById(questId);
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    // Ownership check
    if (quest.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this quest" },
        { status: 403 }
      );
    }

    await Quest.findByIdAndDelete(questId);

    return NextResponse.json(
      { success: true, message: "Quest deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/quests/:id error:", error);
    return NextResponse.json(
      { error: "Failed to delete quest" },
      { status: 500 }
    );
  }
}
