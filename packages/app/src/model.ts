// packages/app/src/model.ts
import type { Meal } from "server/models";

/**
 * Global in-memory model for the SPA.
 * For now we just track the list of meals.
 * You can add more fields later.
 */
export interface Model {
  meals?: Meal[];
}

/**
 * Initial model when the app starts.
 */
export const init: Model = {};
