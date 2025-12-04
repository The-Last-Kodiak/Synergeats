// packages/app/src/model.ts
import type { Meal } from "server/models";

export interface Model {
  /** All meals from GET /api/meals */
  meals: Meal[];
  /** Currently selected meal (for detail/edit views) */
  selectedMeal?: Meal;
}

export const init: Model = {
  meals: []
};
