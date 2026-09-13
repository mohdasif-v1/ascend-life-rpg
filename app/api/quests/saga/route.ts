import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import QuestCompletion from "@/models/QuestCompletion";
import "@/models/Quest";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Oracle saga chronicle is unconfigured on server." },
        { status: 503 }
      );
    }

    await connectToDatabase();

    // Fetch user's recent completions up to 8
    const recentCompletions = await QuestCompletion.find({ userId: session.user.id })
      .sort({ completedAt: -1 })
      .limit(8)
      .populate("questId", "title category difficulty source")
      .lean();

    if (recentCompletions.length === 0) {
      return NextResponse.json(
        {
          error: "No completed trials found in your chronicle. Fulfill at least one quest before summoning the Saga Oracle.",
        },
        { status: 400 }
      );
    }

    const questSummaries = recentCompletions.map((c: any) => {
      const title = c.questId?.title || "Unknown trial";
      const cat = c.questId?.category || "General";
      return `- ${title} (${cat}, +${c.xpEarned} XP, +${c.goldEarned} Gold, +${c.attributeXp} ${c.attribute})`;
    }).join("\n");

    const prompt = `You are the Chronicler of ASCEND, a dark-fantasy life RPG.
A champion has recently accomplished these heroic real-world deeds:
${questSummaries}

Write a short, epic, in-character saga summary (2 to 4 sentences maximum) celebrating their recent triumphs, attribute growth, and dedication.
RULES:
1. Pure plain text only. No markdown headings, no bullet points, no emojis.
2. Maintain an inspiring, respectful dark-fantasy arcane tone.
3. Maximum 350 characters.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
      },
    });

    const response = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Saga recitation timed out.")), 15000)
      ),
    ]);

    let text = response.response.text().trim();
    // Safety truncation
    if (text.length > 500) {
      text = text.slice(0, 497) + "...";
    }

    return NextResponse.json(
      {
        success: true,
        saga: text,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/quests/saga error:", error);
    return NextResponse.json(
      { error: "The Oracle Chronicler could not scribe your saga at this moment. Please try again." },
      { status: 500 }
    );
  }
}
