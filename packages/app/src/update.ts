// packages/app/src/update.ts
import { Auth, Message, ThenUpdate } from "@calpoly/mustang";
import type {
  Meal,
  Profile,
  Goal,
  Gender,
  ActivityLevel,
  Plan
} from "server/models";

import { Msg } from "./messages";
import { Model } from "./model";
import { mergeProfileWithMacros } from "./utils/macros";

export default function update(
  message: Msg,
  model: Model,
  user: Auth.User
): Model | ThenUpdate<Model, Msg> {
  const [command, payload, reactions] = message;

  switch (command) {
    // ---------- Meals ----------
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

    case "meal/delete": {
      return [
        model,
        deleteMeal(payload.id, user, reactions ?? {}).then(() => [
          "meals/request",
          {},
          reactions ?? {}
        ])
      ];
    }

    case "meal/create": {
      return [
        model,
        createMeal(payload.meal, user, reactions ?? {}).then((meal) => [
          "meal/load",
          { meal },
          reactions ?? {}
        ])
      ];
    }

    case "plan/save": {
      return [
        model,
        savePlan(
          payload.weeklyPlan,
          payload.myMeals,
          user,
          reactions ?? {}
        ).then((plan) => ["plan/load", { plan }, reactions ?? {}])
      ];
    }

    case "plan/request": {
      return [
        model,
        requestPlan(user).then((plan) => [
          "plan/load",
          { plan },
          reactions ?? {}
        ])
      ];
    }

    case "plan/load": {
      return { ...model, plan: payload.plan };
    }

    // ---------- Profile / Plan ----------
    case "profile/request": {
      return [
        model,
        requestProfile(user).then((profile) => [
          "profile/load",
          { profile },
          reactions ?? {}
        ])
      ];
    }

    case "profile/load": {
      return { ...model, profile: mergeProfileWithMacros(payload.profile) };
    }

    case "profile/save": {
      // Pull userid from JWT (supports either `username` or `sub`)
      const userid =
        (user as any)?.username ??
        (user as any)?.sub ??
        (user as any)?.userid ??
        undefined;

      const optimistic: Profile | undefined =
        userid && payload
          ? {
              ...(model.profile ?? {}),
              userid,
              weightLbs: payload.weightLbs ?? model.profile?.weightLbs ?? 0,
              goal: payload.goal ?? model.profile?.goal ?? "maintain",
              gender: payload.gender as Gender | undefined,
              activityLevel: payload.activityLevel as
                | ActivityLevel
                | undefined,
              activityHours: payload.activityHours,
              dietaryPreferences: payload.dietaryPreferences,
              calories: payload.calories,
              proteinTarget: payload.proteinTarget,
              carbsTarget: payload.carbsTarget,
              fatTarget: payload.fatTarget,
              weeklyPlan: payload.weeklyPlan ?? model.profile?.weeklyPlan
            }
          : model.profile;

      return [
        { ...model, profile: optimistic },
        saveProfile(payload, user, reactions ?? {}).then((profile) => [
          "profile/load",
          { profile },
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

// ---------- helpers ----------

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

function createMeal(
  meal: Meal,
  user: Auth.User,
  reactions: Message.Reactions
): Promise<Meal> {
  return fetch(`/api/meals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...Auth.headers(user)
    },
    body: JSON.stringify(meal)
  })
    .then((r: Response) => {
      if (r.ok) return r.json();
      throw new Error(`Failed to create meal: ${r.status}`);
    })
    .then((json: unknown) => {
      const created = json as Meal;
      reactions.onSuccess?.();
      return created;
    })
    .catch((err) => {
      reactions.onFailure?.(err);
      throw err;
    });
}

function deleteMeal(
  id: string,
  user: Auth.User,
  reactions: Message.Reactions
): Promise<void> {
  return fetch(`/api/meals/${id}`, {
    method: "DELETE",
    headers: {
      ...Auth.headers(user)
    }
  })
    .then((r: Response) => {
      if (r.ok) {
        reactions.onSuccess?.();
        return;
      }
      throw new Error(`Failed to delete meal: ${r.status}`);
    })
    .catch((err) => {
      reactions.onFailure?.(err);
      throw err;
    });
}

function requestPlan(user: Auth.User): Promise<Plan> {
  const headers = Auth.headers(user);
  const userid =
    (user as any)?.username ??
    (user as any)?.sub ??
    (user as any)?.userid ??
    "guest";
  return fetch("/api/plan", { headers })
    .then((r) => {
      if (r.status === 401) throw new Error("Not authenticated");
      if (r.ok) return r.json();
      return { userid, weeklyPlan: {}, myMeals: [] } as Plan;
    })
    .catch(() => ({ userid, weeklyPlan: {}, myMeals: [] } as Plan));
}

function savePlan(
  weeklyPlan: Record<string, string[]>,
  myMeals: string[],
  user: Auth.User,
  reactions: Message.Reactions
): Promise<Plan> {
  const headers = {
    "Content-Type": "application/json",
    ...Auth.headers(user)
  };
  return fetch("/api/plan", {
    method: "PUT",
    headers,
    body: JSON.stringify({ weeklyPlan, myMeals })
  })
    .then((r) => {
      if (r.ok) return r.json();
      throw new Error(`Failed to save plan: ${r.status}`);
    })
    .then((json: unknown) => {
      const plan = json as Plan;
      reactions.onSuccess?.();
      return plan;
    })
    .catch((err) => {
      reactions.onFailure?.(err);
      throw err;
    });
}

function requestProfile(user: Auth.User): Promise<Profile> {
  const userid =
    (user as any)?.username ??
    (user as any)?.sub ??
    (user as any)?.userid ??
    undefined;
  if (!userid) {
    return Promise.reject(new Error("No logged-in user"));
  }

  return fetch(`/api/profile/${userid}`, {
    headers: Auth.headers(user)
  })
    .then((r) => {
      if (r.status === 404) {
        // No profile yet for this user — return a default
        return {
          userid,
          weightLbs: 0,
          goal: "maintain" as Goal
        };
      }
      if (r.ok) return r.json();
      throw new Error(`Failed to load profile: ${r.status}`);
    })
    .then((json: unknown) => json as Profile);
}

function saveProfile(
  payload: {
    weightLbs: number;
    goal: Goal;
    gender?: string;
    activityLevel?: string;
    dietaryPreferences?: string[];
    activityHours?: number;
    calories?: number;
    proteinTarget?: number;
    carbsTarget?: number;
    fatTarget?: number;
    weeklyPlan?: Record<string, string[]>;
  },
  user: Auth.User,
  reactions: Message.Reactions
): Promise<Profile> {
  const userid =
    (user as any)?.username ??
    (user as any)?.sub ??
    (user as any)?.userid ??
    undefined;
  if (!userid) {
    const err = new Error("No logged-in user");
    reactions.onFailure?.(err);
    return Promise.reject(err);
  }

  return fetch(`/api/profile/${userid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...Auth.headers(user)
    },
    body: JSON.stringify(payload)
  })
    .then((r: Response) => {
      if (r.ok) return r.json();
      throw new Error(`Failed to save profile: ${r.status}`);
    })
    .then((json: unknown) => {
      const profile = json as Profile;
      reactions.onSuccess?.();
      return profile;
    })
    .catch((err) => {
      reactions.onFailure?.(err);
      throw err;
    });
}
