import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import QuestCompletion from "@/models/QuestCompletion";
import "@/models/Quest"; // Ensure Quest schema is registered for populate

export const dynamic = "force-dynamic";

// GET /api/quests/history - Return authenticated user's completion records newest first
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const history = await QuestCompletion.find({ userId: session.user.id })
      .sort({ completedAt: -1 })
      .populate("questId", "title category difficulty source")
      .lean();

    return NextResponse.json(
      {
        success: true,
        history,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/quests/history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chronicle history" },
      { status: 500 }
    );
  }
}
