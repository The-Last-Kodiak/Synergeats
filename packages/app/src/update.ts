// packages/app/src/update.ts
import { Auth, ThenUpdate } from "@calpoly/mustang";
import type { Msg } from "./messages";
import type { Model } from "./model";
import type { Meal } from "server/models";

export default function update(
  message: Msg,
  model: Model,
  user: Auth.User | undefined
): Model | ThenUpdate<Model, Msg> {
  const [tag, payload] = message;

  switch (tag) {
    case "meals/request": {
      // If we already have meals, don't refetch.
      if (model.meals && model.meals.length > 0) {
        return model;
      }

      // Kick off async fetch; when done, dispatch "meals/load".
      return [
        model,
        requestMeals(user).then(
          (meals) => ["meals/load", { meals }] as Msg
        )
      ];
    }

    case "meals/load": {
      const { meals } = payload;
      return { ...model, meals };
    }

    default: {
      // For now, just ignore unknown messages.
      console.warn("Unhandled message in update:", message);
      return model;
    }
  }
}

/**
 * Actually fetch the meals list from the API.
 * Called only from the update function.
 */
function requestMeals(
  user: Auth.User | undefined
): Promise<Meal[]> {
  const headers: HeadersInit = user ? Auth.headers(user) : {};

  return fetch("/api/meals", { headers })
    .then((response) => {
      if (response.status === 200) return response.json();
      if (response.status === 401) {
        throw new Error("Not authorized to load meals");
      }
      throw new Error(`Error ${response.status} from /api/meals`);
    })
    .then((json: unknown) => {
      if (Array.isArray(json)) return json as Meal[];
      throw new Error("Unexpected JSON from /api/meals");
    });
}
