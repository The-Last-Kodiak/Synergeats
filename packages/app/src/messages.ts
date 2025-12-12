// packages/app/src/messages.ts
import { Message } from "@calpoly/mustang";
import type { Meal, Profile, Goal, Plan } from "server/models";

export type Msg =
  | ["meals/request", {}, Message.Reactions]
  | ["meals/load", { meals: Meal[] }, Message.Reactions]
  | ["meal/request", { id: string }, Message.Reactions]
  | ["meal/load", { meal: Meal }, Message.Reactions]
  | ["meal/create", { meal: Meal }, Message.Reactions]
  | ["meal/save", { id: string; meal: Meal }, Message.Reactions]
  | ["meal/delete", { id: string }, Message.Reactions]
  | [
      "plan/save",
      { weeklyPlan: Record<string, string[]>; myMeals: string[] },
      Message.Reactions
    ]
  | ["plan/request", {}, Message.Reactions]
  | ["plan/load", { plan: Plan }, Message.Reactions]
  | ["profile/request", {}, Message.Reactions]
  | ["profile/load", { profile: Profile }, Message.Reactions]
  | [
      "profile/save",
      {
        weightLbs: number;
        goal: Goal;
        gender?: string;
        activityLevel?: string;
        activityHours?: number;
        dietaryPreferences?: string[];
        calories?: number;
        proteinTarget?: number;
        carbsTarget?: number;
        fatTarget?: number;
        weeklyPlan?: Record<string, string[]>;
      },
      Message.Reactions
    ];
