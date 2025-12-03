// packages/app/src/messages.ts
import type { Meal } from "server/models";

/**
 * MVU messages for Synergeats SPA.
 *
 * - "meals/request": ask the store to load meals from /api/meals
 * - "meals/load": store has received meals and should put them in the model
 */
export type Msg =
  | ["meals/request", {}]
  | ["meals/load", { meals: Meal[] }];
