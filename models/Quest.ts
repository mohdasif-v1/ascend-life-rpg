import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type QuestCategory =
  | "Coding"
  | "Study"
  | "Fitness"
  | "Health"
  | "Mindfulness"
  | "Discipline"
  | string;

export type RPGAttribute =
  | "strength"
  | "intellect"
  | "vitality"
  | "focus"
  | "discipline";

export type QuestDifficulty = "easy" | "medium" | "hard" | "epic";

export interface IQuest extends Document {
  title: string;
  description?: string;
  category: QuestCategory;
  attribute: RPGAttribute;
  difficulty: QuestDifficulty;
  xpReward: number;
  goldReward: number;
  completed: boolean;
  completedAt?: Date | null;
  userId: Types.ObjectId | string;
  source: "manual" | "ai";
  isRedemption: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const QuestSchema = new Schema<IQuest>(
  {
    title: {
      type: String,
      required: [true, "Quest title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    attribute: {
      type: String,
      required: [true, "Attribute is required"],
      enum: ["strength", "intellect", "vitality", "focus", "discipline"],
    },
    difficulty: {
      type: String,
      required: [true, "Difficulty is required"],
      enum: ["easy", "medium", "hard", "epic"],
      default: "easy",
    },
    xpReward: {
      type: Number,
      required: true,
      min: 0,
    },
    goldReward: {
      type: Number,
      required: true,
      min: 0,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["manual", "ai"],
      default: "manual",
    },
    isRedemption: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries by user and creation date
QuestSchema.index({ userId: 1, createdAt: -1 });

const Quest: Model<IQuest> =
  mongoose.models.Quest || mongoose.model<IQuest>("Quest", QuestSchema);

export default Quest;
