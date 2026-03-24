export interface UserProfile {
  id: string;
  user_id: string;
  goal: 'bulk' | 'cut' | 'maintain';
  current_weight_lbs: number;
  weekly_workout_hours: number;
  age: number;
  has_diabetes: boolean;
  allergies: string[];
  special_notes: string;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Food {
  id: string;
  name: string;
  brand: string;
  company_name: string;
  food_group: 'protein' | 'dairy' | 'grain' | 'vegetable' | 'fruit' | 'fat' | 'beverage' | 'other';
  serving_size: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  vitamin_d_mcg: number;
  magnesium_mg: number;
  antioxidant_score: number;
  omega3_mg: number;
  probiotics: boolean;
  price_usd: number;
  efficiency_score: number;
  dish_rating: number;
  available_grocery: boolean;
  available_delivery: boolean;
  delivery_platform: string;
  image_url: string;
  description: string;
  ai_health_notes: string;
  breakfast_icon_url: string;
  lunch_icon_url: string;
  dinner_icon_url: string;
  created_at: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  name: string;
  days_monday: boolean;
  days_tuesday: boolean;
  days_wednesday: boolean;
  days_thursday: boolean;
  days_friday: boolean;
  days_saturday: boolean;
  days_sunday: boolean;
  created_at: string;
  updated_at: string;
  items?: MealPlanItem[];
}

export interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  food_id: string;
  quantity: number;
  meal_time: 'breakfast' | 'lunch' | 'dinner' | 'any';
  created_at: string;
  food?: Food;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  food_id: string;
  quantity: number;
  meal_time: 'breakfast' | 'lunch' | 'dinner' | 'any';
  created_at: string;
  food?: Food;
}

export interface NutritionTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  vitamin_d_mcg: number;
  magnesium_mg: number;
  antioxidant_score: number;
  omega3_mg: number;
}

export interface DailyTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  vitamin_d_mcg: number;
  magnesium_mg: number;
  antioxidant_score: number;
  omega3_mg: number;
}
