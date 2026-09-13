import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type QuestlineStatus = "active" | "completed" | "abandoned";

export interface IQuestline extends Document {
  userId: Types.ObjectId | string;
  title: string;
  goal: string;
  status: QuestlineStatus;
  createdAt: Date;
  updatedAt: Date;
}

const QuestlineSchema = new Schema<IQuestline>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Questline title is required"],
      trim: true,
    },
    goal: {
      type: String,
      required: [true, "Goal is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

QuestlineSchema.index({ userId: 1, createdAt: -1 });

const Questline: Model<IQuestline> =
  mongoose.models.Questline ||
  mongoose.model<IQuestline>("Questline", QuestlineSchema);

export default Questline;
