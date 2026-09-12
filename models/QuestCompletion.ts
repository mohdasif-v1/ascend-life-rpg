import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { RPGAttribute } from "./Quest";

export interface IQuestCompletion extends Document {
  questId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  xpEarned: number;
  goldEarned: number;
  attribute: RPGAttribute;
  attributeXp: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuestCompletionSchema = new Schema<IQuestCompletion>(
  {
    questId: {
      type: Schema.Types.ObjectId,
      ref: "Quest",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    xpEarned: {
      type: Number,
      required: true,
      min: 0,
    },
    goldEarned: {
      type: Number,
      required: true,
      min: 0,
    },
    attribute: {
      type: String,
      required: true,
      enum: ["strength", "intellect", "vitality", "focus", "discipline"],
    },
    attributeXp: {
      type: Number,
      required: true,
      min: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

QuestCompletionSchema.index({ userId: 1, completedAt: -1 });

const QuestCompletion: Model<IQuestCompletion> =
  mongoose.models.QuestCompletion ||
  mongoose.model<IQuestCompletion>("QuestCompletion", QuestCompletionSchema);

export default QuestCompletion;
