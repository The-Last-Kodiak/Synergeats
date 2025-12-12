import { Schema, model } from "mongoose";

export type Goal = "bulk" | "maintain" | "cut";
export type Gender = "male" | "female" | "other" | "unspecified";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "athlete";

export interface Profile {
  userid: string; // username from JWT (user.username or sub)
  weightLbs: number;
  goal: Goal;
  gender?: Gender;
  activityLevel?: ActivityLevel;
  activityHours?: number;
  dietaryPreferences?: string[];
  calories?: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
  // schedule/logging placeholders
  weeklyPlan?: Record<string, string[]>; // day -> array of meal ids
}

const ProfileSchema = new Schema<Profile>({
  userid: { type: String, required: true, unique: true },
  weightLbs: { type: Number, required: true },
  goal: { type: String, enum: ["bulk", "maintain", "cut"], required: true },
  gender: {
    type: String,
    enum: ["male", "female", "other", "unspecified"],
    required: false
  },
  activityLevel: {
    type: String,
    enum: ["sedentary", "light", "moderate", "active", "athlete"],
    required: false
  },
  activityHours: { type: Number, required: false },
  dietaryPreferences: { type: [String], required: false, default: [] },
  calories: { type: Number, required: false },
  proteinTarget: { type: Number, required: false },
  carbsTarget: { type: Number, required: false },
  fatTarget: { type: Number, required: false }
});

export const ProfileModel = model<Profile>("Profile", ProfileSchema);
