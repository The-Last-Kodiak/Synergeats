import { type UserProfile, type DailyTargets } from '../types';

export function computeDailyTargets(profile: UserProfile | null): DailyTargets {
  if (!profile) {
    return {
      calories: 2000,
      protein_g: 150,
      carbs_g: 250,
      fat_g: 65,
      fiber_g: 28,
      vitamin_d_mcg: 20,
      magnesium_mg: 400,
      antioxidant_score: 200,
      omega3_mg: 1600,
    };
  }

  const { goal, current_weight_lbs, weekly_workout_hours, age, has_diabetes } = profile;
  const weightKg = current_weight_lbs * 0.453592;

  let bmr = 10 * weightKg + 6.25 * 170 - 5 * age + 5;
  const activityMultiplier = 1.2 + Math.min(weekly_workout_hours / 10, 0.5);
  let tdee = bmr * activityMultiplier;

  if (goal === 'bulk') tdee += 300;
  else if (goal === 'cut') tdee -= 400;

  const proteinFactor = goal === 'bulk' ? 2.2 : goal === 'cut' ? 2.0 : 1.8;
  const protein = Math.round(weightKg * proteinFactor);

  const carbCalories = has_diabetes ? tdee * 0.35 : tdee * 0.45;
  const carbs = Math.round(carbCalories / 4);

  const fatCalories = tdee * 0.3;
  const fat = Math.round(fatCalories / 9);

  return {
    calories: Math.round(tdee),
    protein_g: protein,
    carbs_g: carbs,
    fat_g: fat,
    fiber_g: age < 50 ? 38 : 30,
    vitamin_d_mcg: age > 70 ? 20 : 15,
    magnesium_mg: age > 30 ? 420 : 400,
    antioxidant_score: 150,
    omega3_mg: 1600,
  };
}

export const FOOD_GROUP_COLORS: Record<string, string> = {
  protein: '#e53e3e',
  dairy: '#ed8936',
  grain: '#ecc94b',
  vegetable: '#48bb78',
  fruit: '#f6ad55',
  fat: '#4299e1',
  beverage: '#38b2ac',
  other: '#a0aec0',
};

export const FOOD_GROUP_LABELS: Record<string, string> = {
  protein: 'Protein',
  dairy: 'Dairy',
  grain: 'Grains',
  vegetable: 'Vegetables',
  fruit: 'Fruits',
  fat: 'Healthy Fats',
  beverage: 'Beverages',
  other: 'Other',
};
