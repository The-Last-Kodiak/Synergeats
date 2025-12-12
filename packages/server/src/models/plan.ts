import { Schema, model } from "mongoose";

export interface Plan {
  userid: string;
  weeklyPlan: Record<string, string[]>;
  myMeals?: string[];
}

const PlanSchema = new Schema<Plan>({
  userid: { type: String, required: true, unique: true },
  weeklyPlan: { type: Schema.Types.Mixed, required: true },
  myMeals: { type: [String], default: [] }
});

export const PlanModel = model<Plan>("Plan", PlanSchema, "UserPlans");
