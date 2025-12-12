import type { ActivityLevel, Goal, Gender, Profile } from "server/models";

type MacroEstimate = {
  calories: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
};

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 12,
  light: 13,
  moderate: 14,
  active: 15,
  athlete: 16
};

function activityFromHours(hours?: number): ActivityLevel {
  if (hours === undefined || Number.isNaN(hours)) return "moderate";
  if (hours <= 1) return "sedentary";
  if (hours <= 3) return "light";
  if (hours <= 6) return "moderate";
  if (hours <= 10) return "active";
  return "athlete";
}

/**
 * Very lightweight macro estimator.
 * Uses weight-based TDEE approximation multiplied by activity
 * and nudged by goal. Splits macros as:
 *  - Protein: 0.8-1.0 g/lb
 *  - Fat:     0.30 g/lb
 *  - Carbs:   remaining calories
 */
export function estimateMacros(opts: {
  weightLbs: number;
  goal: Goal;
  gender?: Gender;
  activityLevel?: ActivityLevel;
  activityHours?: number;
}): MacroEstimate {
  const { weightLbs, goal } = opts;
  const activity = opts.activityLevel ?? activityFromHours(opts.activityHours);
  const factor = ACTIVITY_FACTOR[activity] ?? ACTIVITY_FACTOR.moderate;

  const baseCalories = weightLbs * factor;
  const goalAdjust =
    goal === "bulk" ? 300 : goal === "cut" ? -300 : 0;
  const calories = Math.max(1200, Math.round(baseCalories + goalAdjust));

  const proteinPerLb = goal === "cut" ? 1.0 : 0.85;
  const proteinTarget = Math.round(weightLbs * proteinPerLb);

  const fatTarget = Math.round(weightLbs * 0.3);

  const remainingCalories = Math.max(
    0,
    calories - proteinTarget * 4 - fatTarget * 9
  );
  const carbsTarget = Math.round(remainingCalories / 4);

  return {
    calories,
    proteinTarget,
    carbsTarget,
    fatTarget
  };
}

export function mergeProfileWithMacros(
  profile: Profile | undefined
): Profile | undefined {
  if (!profile) return profile;

  const {
    weightLbs,
    goal,
    gender,
    activityLevel,
    calories,
    proteinTarget,
    carbsTarget,
    fatTarget
  } = profile;

  if (
    calories &&
    proteinTarget &&
    carbsTarget &&
    fatTarget
  ) {
    return profile;
  }

  if (weightLbs && goal) {
    const estimate = estimateMacros({
      weightLbs,
      goal,
      gender,
      activityLevel
    });

    return {
      ...profile,
      ...estimate
    };
  }

  return profile;
}
