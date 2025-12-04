// packages/app/src/update.ts
import { Auth, Message, ThenUpdate } from "@calpoly/mustang";
import { Msg } from "./messages";
import { Model } from "./model";
import { Meal } from "server/models";

export default function update(
  message: Msg,
  model: Model,
  user: Auth.User
): Model | ThenUpdate<Model, Msg> {
  const [command, payload, reactions] = message;

  switch (command) {
    case "meals/request": {
      return [
        model,
        requestMeals(user).then((meals) => [
          "meals/load",
          { meals },
          reactions ?? {}
        ])
      ];
    }

    case "meals/load": {
      return { ...model, meals: payload.meals };
    }

    case "meal/request": {
      return [
        model,
        requestMeal(payload.id, user).then((meal) => [
          "meal/load",
          { meal },
          reactions ?? {}
        ])
      ];
    }

    case "meal/load": {
      return { ...model, selectedMeal: payload.meal };
    }

    case "meal/save": {
      return [
        model,
        saveMeal(payload, user, reactions ?? {}).then((meal) => [
          "meal/load",
          { meal },
          reactions ?? {}
        ])
      ];
    }

    default: {
      const unhandled: never = command;
      throw new Error(`Unhandled message "${unhandled}"`);
    }
  }
}

// ---- helpers ----

function requestMeals(user: Auth.User): Promise<Meal[]> {
  return fetch("/api/meals", {
    headers: Auth.headers(user)
  })
    .then((r) => {
      if (r.ok) return r.json();
      throw new Error(`Failed to load meals: ${r.status}`);
    })
    .then((json: unknown) => json as Meal[]);
}

function requestMeal(id: string, user: Auth.User): Promise<Meal> {
  return fetch(`/api/meals/${id}`, {
    headers: Auth.headers(user)
  })
    .then((r) => {
      if (r.ok) return r.json();
      throw new Error(`Failed to load meal ${id}: ${r.status}`);
    })
    .then((json: unknown) => json as Meal);
}

function saveMeal(
  msg: { id: string; meal: Meal },
  user: Auth.User,
  reactions: Message.Reactions
): Promise<Meal> {
  return fetch(`/api/meals/${msg.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...Auth.headers(user)
    },
    body: JSON.stringify(msg.meal)
  })
    .then((r: Response) => {
      if (r.ok) return r.json();
      throw new Error(`Failed to save meal ${msg.id}: ${r.status}`);
    })
    .then((json: unknown) => {
      const meal = json as Meal;
      reactions.onSuccess?.();
      return meal;
    })
    .catch((err) => {
      reactions.onFailure?.(err);
      throw err;
    });
}
