import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Quest from "@/models/Quest";
import { getQuestRewards } from "@/lib/rpg";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate email presence and format
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Validate password presence and length
    if (!password || typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    await connectToDatabase();

    // Check for existing user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (salt rounds = 12)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // PHASE 3 GUARANTEED DEMO PATH:
    // With formula Math.floor(100 * Math.pow(level, 1.5)), Level 2 threshold is xpForLevel(2) = 282.
    // Every newly registered user begins near the Level 2 threshold:
    // level: 1, xp: 240.
    // Completing the starter quest (50 XP) brings total to 290 XP >= 282 XP -> LEVEL 2!
    const newUser = await User.create({
      email: normalizedEmail,
      passwordHash,
      level: 1,
      xp: 240,
      gold: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      attributes: {
        strength: 0,
        intellect: 0,
        vitality: 0,
        focus: 0,
        discipline: 0,
      },
    });

    // Seed one ready-to-complete starter quest:
    // Easy difficulty awards 50 XP. With starting XP 80, completing this gives 130 XP >= 100 XP -> LEVEL 2!
    const starterRewards = getQuestRewards("easy");
    await Quest.create({
      title: "Complete your first coding quest",
      description: "Solve one small programming problem.",
      category: "Coding",
      attribute: "intellect",
      difficulty: "easy",
      xpReward: starterRewards.xpReward,
      goldReward: starterRewards.goldReward,
      completed: false,
      userId: newUser._id,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
