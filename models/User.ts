import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUserAttributes {
  strength: number;
  intellect: number;
  vitality: number;
  focus: number;
  discipline: number;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  level: number;
  xp: number;
  gold: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  attributes: IUserAttributes;
  aiGenerationsToday: number;
  aiGenerationsResetAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    gold: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActivityDate: {
      type: Date,
      default: null,
    },
    attributes: {
      strength: { type: Number, default: 0, min: 0 },
      intellect: { type: Number, default: 0, min: 0 },
      vitality: { type: Number, default: 0, min: 0 },
      focus: { type: Number, default: 0, min: 0 },
      discipline: { type: Number, default: 0, min: 0 },
    },
    aiGenerationsToday: {
      type: Number,
      default: 0,
      min: 0,
    },
    aiGenerationsResetAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model overwrite error during Next.js hot reloads
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
