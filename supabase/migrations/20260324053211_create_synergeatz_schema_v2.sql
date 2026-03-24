/*
  # Synergeatz Database Schema v2

  ## Overview
  Full schema for the Synergeatz nutrition and meal planning app.
  Uses DROP IF EXISTS on policies before recreating to ensure idempotent migrations.

  ## Tables
  - user_profiles: onboarding data per user
  - foods: master food catalog with macros and nutrients
  - meal_plans: up to 7 saved weekly plans per user
  - meal_plan_items: food items inside each plan
  - daily_logs: per-day food consumption log
*/

-- user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  goal text DEFAULT 'maintain' CHECK (goal IN ('bulk', 'cut', 'maintain')),
  current_weight_lbs numeric DEFAULT 0,
  weekly_workout_hours numeric DEFAULT 0,
  age integer DEFAULT 25,
  has_diabetes boolean DEFAULT false,
  allergies text[] DEFAULT '{}',
  special_notes text DEFAULT '',
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- foods
CREATE TABLE IF NOT EXISTS foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text DEFAULT '',
  company_name text DEFAULT '',
  food_group text DEFAULT 'other' CHECK (food_group IN ('protein','dairy','grain','vegetable','fruit','fat','beverage','other')),
  serving_size text DEFAULT '100g',
  calories numeric DEFAULT 0,
  protein_g numeric DEFAULT 0,
  carbs_g numeric DEFAULT 0,
  fat_g numeric DEFAULT 0,
  fiber_g numeric DEFAULT 0,
  sugar_g numeric DEFAULT 0,
  vitamin_d_mcg numeric DEFAULT 0,
  magnesium_mg numeric DEFAULT 0,
  antioxidant_score numeric DEFAULT 0,
  omega3_mg numeric DEFAULT 0,
  probiotics boolean DEFAULT false,
  price_usd numeric DEFAULT 0,
  efficiency_score numeric DEFAULT 0,
  dish_rating numeric DEFAULT 0 CHECK (dish_rating >= 0 AND dish_rating <= 5),
  available_grocery boolean DEFAULT true,
  available_delivery boolean DEFAULT false,
  delivery_platform text DEFAULT '',
  image_url text DEFAULT '',
  description text DEFAULT '',
  ai_health_notes text DEFAULT '',
  breakfast_icon_url text DEFAULT '',
  lunch_icon_url text DEFAULT '',
  dinner_icon_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read foods" ON foods;

CREATE POLICY "Anyone can read foods"
  ON foods FOR SELECT
  TO authenticated
  USING (true);

-- meal_plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'My Plan',
  days_monday boolean DEFAULT false,
  days_tuesday boolean DEFAULT false,
  days_wednesday boolean DEFAULT false,
  days_thursday boolean DEFAULT false,
  days_friday boolean DEFAULT false,
  days_saturday boolean DEFAULT false,
  days_sunday boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can insert own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can update own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can delete own meal plans" ON meal_plans;

CREATE POLICY "Users can read own meal plans"
  ON meal_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans"
  ON meal_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans"
  ON meal_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans"
  ON meal_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- meal_plan_items
CREATE TABLE IF NOT EXISTS meal_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id uuid REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
  food_id uuid REFERENCES foods(id) ON DELETE CASCADE NOT NULL,
  quantity numeric DEFAULT 1,
  meal_time text DEFAULT 'any' CHECK (meal_time IN ('breakfast','lunch','dinner','any')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own meal plan items" ON meal_plan_items;
DROP POLICY IF EXISTS "Users can insert own meal plan items" ON meal_plan_items;
DROP POLICY IF EXISTS "Users can update own meal plan items" ON meal_plan_items;
DROP POLICY IF EXISTS "Users can delete own meal plan items" ON meal_plan_items;

CREATE POLICY "Users can read own meal plan items"
  ON meal_plan_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own meal plan items"
  ON meal_plan_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own meal plan items"
  ON meal_plan_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own meal plan items"
  ON meal_plan_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

-- daily_logs
CREATE TABLE IF NOT EXISTS daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  food_id uuid REFERENCES foods(id) ON DELETE CASCADE NOT NULL,
  quantity numeric DEFAULT 1,
  meal_time text DEFAULT 'any' CHECK (meal_time IN ('breakfast','lunch','dinner','any')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, log_date, food_id, meal_time)
);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own daily logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can insert own daily logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can update own daily logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can delete own daily logs" ON daily_logs;

CREATE POLICY "Users can read own daily logs"
  ON daily_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily logs"
  ON daily_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily logs"
  ON daily_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily logs"
  ON daily_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_plan_id ON meal_plan_items(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_foods_food_group ON foods(food_group);
