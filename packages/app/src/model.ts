// packages/app/src/model.ts
import type { Meal, Profile, Plan } from "server/models";

//export interface Profile {weightLbs: number;goal: "bulk" | "maintain" | "cut";}

export interface Model {
  /** All meals from GET /api/meals */
  meals: Meal[];
  /** Currently selected meal (for detail/edit views) */
  selectedMeal?: Meal;

  /** Simple client-side user profile for planning */
  profile?: Profile;

  /** Weekly plan */
  plan?: Plan;
}

export const init: Model = {
  meals: [],
  profile: undefined,
  plan: undefined
};
