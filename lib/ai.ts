import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { VALID_ATTRIBUTES, VALID_DIFFICULTIES, getQuestRewards } from "./rpg";
import { QuestDifficulty, RPGAttribute } from "@/models/Quest";

export const DAILY_AI_LIMIT = 5;

export const QuestDraftSchema = z.object({
  title: z.string().min(3).max(80),
  description: z.string().max(200).default(""),
  category: z.string().min(2).max(30),
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
});

export const QuestDraftsArraySchema = z.array(QuestDraftSchema).min(1).max(4);

export type ValidatedQuestDraft = z.infer<typeof QuestDraftSchema> & {
  xpReward: number;
  goldReward: number;
};

export function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the server environment.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-1.5-flash or gemini-1.5-pro
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });
}

export function cleanAndParseJson(text: string): unknown {
  const trimmed = text.trim();
  const cleaned = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}
