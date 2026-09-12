import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { xpForLevel } from "@/lib/rpg";

export const dynamic = "force-dynamic";

// GET /api/user/character - Return authenticated user's character stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id)
      .select("-passwordHash")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentLevel = user.level || 1;
    const currentLevelBaseXp = currentLevel > 1 ? xpForLevel(currentLevel) : 0;
    const nextLevelTargetXp = xpForLevel(currentLevel + 1);

    return NextResponse.json(
      {
        success: true,
        character: {
          id: user._id.toString(),
          email: user.email,
          level: currentLevel,
          xp: user.xp || 0,
          gold: user.gold || 0,
          currentStreak: user.currentStreak || 0,
          longestStreak: user.longestStreak || 0,
          lastActivityDate: user.lastActivityDate,
          attributes: user.attributes || {
            strength: 0,
            intellect: 0,
            vitality: 0,
            focus: 0,
            discipline: 0,
          },
          currentLevelBaseXp,
          nextLevelTargetXp,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/user/character error:", error);
    return NextResponse.json(
      { error: "Failed to fetch character profile" },
      { status: 500 }
    );
  }
}
