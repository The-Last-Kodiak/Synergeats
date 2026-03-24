/*
  # Fix Schema and Seed Fake Foods

  ## Changes
  1. Adds current_weight_lbs, diet_type, special_notes to user_profiles if missing
  2. Adds food_id, quantity, meal_time, updated_at to daily_logs if missing
  3. Adds is_today_plan, today_plan_date, name, day columns to meal_plans if missing
  4. Creates meal_plan_items table if not exists
  5. Seeds 30 fake food items from made-up brands/stores
  6. Allows public food reads (no auth required for browsing)
*/

-- Fix user_profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='current_weight_lbs') THEN
    ALTER TABLE user_profiles ADD COLUMN current_weight_lbs numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='diet_type') THEN
    ALTER TABLE user_profiles ADD COLUMN diet_type text DEFAULT 'none';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='special_notes') THEN
    ALTER TABLE user_profiles ADD COLUMN special_notes text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='allergies') THEN
    ALTER TABLE user_profiles ADD COLUMN allergies text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='has_diabetes') THEN
    ALTER TABLE user_profiles ADD COLUMN has_diabetes boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='onboarding_complete') THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_complete boolean DEFAULT false;
  END IF;
END $$;

-- Fix daily_logs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='daily_logs' AND column_name='food_id') THEN
    ALTER TABLE daily_logs ADD COLUMN food_id uuid REFERENCES foods(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='daily_logs' AND column_name='quantity') THEN
    ALTER TABLE daily_logs ADD COLUMN quantity numeric DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='daily_logs' AND column_name='meal_time') THEN
    ALTER TABLE daily_logs ADD COLUMN meal_time text DEFAULT 'any';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='daily_logs' AND column_name='updated_at') THEN
    ALTER TABLE daily_logs ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add unique constraint to daily_logs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'daily_logs_user_date_food_meal_key') THEN
    ALTER TABLE daily_logs ADD CONSTRAINT daily_logs_user_date_food_meal_key
      UNIQUE (user_id, log_date, food_id, meal_time);
  END IF;
END $$;

-- Fix meal_plans
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meal_plans' AND column_name='name') THEN
    ALTER TABLE meal_plans ADD COLUMN name text DEFAULT 'My Plan';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meal_plans' AND column_name='is_today_plan') THEN
    ALTER TABLE meal_plans ADD COLUMN is_today_plan boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meal_plans' AND column_name='today_plan_date') THEN
    ALTER TABLE meal_plans ADD COLUMN today_plan_date date DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meal_plans' AND column_name='days_monday') THEN
    ALTER TABLE meal_plans ADD COLUMN days_monday boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meal_plans' AND column_name='days_tuesday') THEN
    ALTER TABLE meal_plans ADD COLUMN days_tuesday boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meal_plans' AND column_name='days_wednesday') THEN
    ALTER TABLE meal_plans ADD COLUMN days_wednesday boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meal_plans' AND column_name='days_thursday') THEN
    ALTER TABLE meal_plans ADD COLUMN days_thursday boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meal_plans' AND column_name='days_friday') THEN
    ALTER TABLE meal_plans ADD COLUMN days_friday boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meal_plans' AND column_name='days_saturday') THEN
    ALTER TABLE meal_plans ADD COLUMN days_saturday boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meal_plans' AND column_name='days_sunday') THEN
    ALTER TABLE meal_plans ADD COLUMN days_sunday boolean DEFAULT false;
  END IF;
END $$;

-- Create meal_plan_items
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
  ON meal_plan_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM meal_plans WHERE meal_plans.id = meal_plan_items.meal_plan_id AND meal_plans.user_id = auth.uid()));
CREATE POLICY "Users can insert own meal plan items"
  ON meal_plan_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM meal_plans WHERE meal_plans.id = meal_plan_items.meal_plan_id AND meal_plans.user_id = auth.uid()));
CREATE POLICY "Users can update own meal plan items"
  ON meal_plan_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM meal_plans WHERE meal_plans.id = meal_plan_items.meal_plan_id AND meal_plans.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM meal_plans WHERE meal_plans.id = meal_plan_items.meal_plan_id AND meal_plans.user_id = auth.uid()));
CREATE POLICY "Users can delete own meal plan items"
  ON meal_plan_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM meal_plans WHERE meal_plans.id = meal_plan_items.meal_plan_id AND meal_plans.user_id = auth.uid()));

-- Allow public reads on foods (for guest browsing)
DROP POLICY IF EXISTS "Anyone can read foods" ON foods;
DROP POLICY IF EXISTS "Public can read foods" ON foods;
CREATE POLICY "Public can read foods" ON foods FOR SELECT USING (true);

-- RLS for daily_logs
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own daily logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can insert own daily logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can update own daily logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can delete own daily logs" ON daily_logs;
CREATE POLICY "Users can read own daily logs" ON daily_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily logs" ON daily_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily logs" ON daily_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily logs" ON daily_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_plan_id ON meal_plan_items(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, log_date);

-- Seed fake foods (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM foods LIMIT 1) THEN
    INSERT INTO foods (name, brand, company_name, food_group, serving_size, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, vitamin_d_mcg, magnesium_mg, antioxidant_score, omega3_mg, probiotics, price_usd, efficiency_score, dish_rating, available_grocery, available_delivery, image_url, ai_health_notes) VALUES
    ('Grilled Chicken Breast', 'FreshFarm Co.', 'FreshFarm Foods', 'protein', '100g', 165, 31, 0, 3.6, 0, 0, 0.1, 28, 15, 80, false, 4.99, 8.7, 4.5, true, true, 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&w=400', 'High-protein lean meat, excellent for muscle building.'),
    ('Atlantic Salmon Fillet', 'OceanPure', 'OceanPure Seafoods', 'protein', '100g', 208, 20, 0, 13, 0, 0, 11.1, 27, 40, 2260, false, 9.49, 9.2, 4.8, true, true, 'https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg?auto=compress&w=400', 'Rich in omega-3 and vitamin D. Anti-inflammatory superfood.'),
    ('Free-Range Eggs', 'SunRise Farm', 'SunRise Organics', 'protein', '2 large eggs', 143, 12.6, 1, 9.8, 0, 0.8, 2.0, 12, 20, 180, false, 3.49, 8.4, 4.6, true, false, 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&w=400', 'Complete protein with all essential amino acids.'),
    ('Greek Yogurt', 'CreamyPeak', 'CreamyPeak Dairy', 'dairy', '150g', 100, 17, 6, 0.7, 0, 5, 0.1, 17, 8, 30, true, 2.99, 8.0, 4.4, true, false, 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&w=400', 'Probiotic-rich with high protein. Supports gut health.'),
    ('Whole Milk', 'GreenPasture', 'GreenPasture Dairy', 'dairy', '240ml', 149, 8, 12, 8, 0, 12, 2.9, 24, 0, 183, false, 1.79, 6.5, 4.0, true, false, 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&w=400', 'Rich in calcium and vitamin D for bone health.'),
    ('Cheddar Cheese', 'BoldCheddar Co.', 'BoldCheddar Co.', 'dairy', '30g', 113, 7, 0.4, 9.3, 0, 0.1, 0.2, 8, 5, 60, false, 2.49, 5.8, 4.2, true, false, 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&w=400', 'Good source of calcium and protein.'),
    ('Brown Rice', 'NaturalGrain', 'NaturalGrain Co.', 'grain', '1/2 cup cooked', 108, 2.5, 22, 0.9, 1.8, 0.4, 0, 42, 12, 10, false, 1.29, 6.2, 3.8, true, false, 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&w=400', 'Complex carbs with fiber for sustained energy.'),
    ('Rolled Oats', 'MorningMill', 'MorningMill Grains', 'grain', '1/2 cup dry', 150, 5, 27, 2.5, 4, 1, 0, 44, 18, 40, false, 2.19, 7.5, 4.3, true, false, 'https://images.pexels.com/photos/704569/pexels-photo-704569.jpeg?auto=compress&w=400', 'Beta-glucan fiber reduces cholesterol and blood sugar.'),
    ('Whole Wheat Bread', 'RusticLoaf', 'RusticLoaf Bakery', 'grain', '2 slices', 138, 6, 24, 2, 4, 4, 0.1, 28, 10, 30, false, 3.49, 6.0, 3.9, true, false, 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&w=400', 'Higher fiber than white bread. Good for digestive health.'),
    ('Sweet Potato', 'HarvestRoot', 'HarvestRoot Farms', 'vegetable', '1 medium (130g)', 103, 2.3, 24, 0.1, 3.8, 7, 0, 25, 85, 20, false, 1.49, 8.3, 4.7, true, false, 'https://images.pexels.com/photos/89247/pexels-photo-89247.jpeg?auto=compress&w=400', 'Rich in beta-carotene and antioxidants. High fiber.'),
    ('Broccoli', 'GreenGrove', 'GreenGrove Organics', 'vegetable', '1 cup (91g)', 31, 2.6, 6, 0.3, 2.4, 1.5, 0, 19, 120, 60, false, 1.99, 9.1, 4.5, true, true, 'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&w=400', 'Anti-cancer compounds, high vitamin C and K.'),
    ('Baby Spinach', 'LeafyGreen Co.', 'LeafyGreen Co.', 'vegetable', '2 cups (60g)', 14, 1.7, 2.2, 0.2, 1.3, 0.3, 0, 47, 160, 80, false, 3.49, 9.4, 4.6, true, true, 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&w=400', 'Loaded with iron, magnesium and antioxidants.'),
    ('Avocado', 'TropicFresh', 'TropicFresh Imports', 'fat', '1/2 avocado (68g)', 114, 1.3, 6, 10.5, 4.6, 0.2, 0, 19, 90, 110, false, 1.49, 8.8, 4.9, true, true, 'https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg?auto=compress&w=400', 'Heart-healthy monounsaturated fats and potassium.'),
    ('Mixed Nuts', 'NutVault', 'NutVault Snacks', 'fat', '28g (1 oz)', 173, 5, 6, 16, 2, 1, 0, 57, 80, 170, false, 6.99, 7.9, 4.3, true, false, 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&w=400', 'Heart-healthy fats with selenium and magnesium.'),
    ('Extra Virgin Olive Oil', 'MediterraPress', 'MediterraPress Oils', 'fat', '1 tbsp (14g)', 119, 0, 0, 13.5, 0, 0, 0, 0.1, 110, 130, false, 8.99, 8.5, 4.7, true, false, 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&w=400', 'Potent anti-inflammatory polyphenols.'),
    ('Blueberries', 'BerryBurst', 'BerryBurst Farms', 'fruit', '1 cup (148g)', 84, 1.1, 21, 0.5, 3.6, 14.7, 0, 9, 220, 70, false, 4.99, 9.0, 4.9, true, true, 'https://images.pexels.com/photos/1153655/pexels-photo-1153655.jpeg?auto=compress&w=400', 'Highest antioxidant density of any fruit. Brain health.'),
    ('Banana', 'TropicGold', 'TropicGold Imports', 'fruit', '1 medium (118g)', 105, 1.3, 27, 0.4, 3.1, 14.4, 0, 32, 65, 30, false, 0.49, 7.2, 4.2, true, false, 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&w=400', 'Quick energy, potassium for muscle function.'),
    ('Strawberries', 'SunripePickings', 'SunripePickings', 'fruit', '1 cup (152g)', 49, 1, 12, 0.5, 3, 7.4, 0, 20, 185, 40, false, 3.99, 8.6, 4.7, true, true, 'https://images.pexels.com/photos/46174/strawberries-berries-fruit-freshness-46174.jpeg?auto=compress&w=400', 'Very high vitamin C. Potent anti-inflammatory.'),
    ('Green Tea', 'ZenLeaf', 'ZenLeaf Teas', 'beverage', '240ml brewed', 2, 0, 0, 0, 0, 0, 0, 1.6, 150, 0, false, 0.50, 9.5, 4.8, true, false, 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&w=400', 'EGCG catechins powerful antioxidants, boosts metabolism.'),
    ('Cold Brew Coffee', 'BrewHouse Craft', 'BrewHouse Craft', 'beverage', '240ml', 5, 0.3, 0.5, 0, 0, 0, 0, 8, 40, 0, false, 2.99, 7.8, 4.4, true, true, 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&w=400', 'Antioxidant-rich, may improve cognitive function.'),
    ('Black Beans', 'LegumeLand', 'LegumeLand Co.', 'protein', '1/2 cup cooked', 114, 7.6, 20, 0.5, 7.5, 0.3, 0, 60, 45, 30, false, 1.29, 8.9, 4.3, true, false, 'https://images.pexels.com/photos/5409715/pexels-photo-5409715.jpeg?auto=compress&w=400', 'Plant-based protein with high fiber. Good for heart.'),
    ('Tofu', 'PureBean', 'PureBean Organics', 'protein', '100g firm', 76, 8, 1.9, 4.2, 0.3, 0.5, 0.1, 121, 20, 200, false, 2.49, 8.1, 4.0, true, false, 'https://images.pexels.com/photos/5737586/pexels-photo-5737586.jpeg?auto=compress&w=400', 'Complete plant protein, rich in calcium.'),
    ('Kale', 'SuperLeaf', 'SuperLeaf Organics', 'vegetable', '1 cup chopped (67g)', 33, 2.9, 6, 0.5, 1.3, 1.6, 0, 23, 245, 120, false, 2.99, 9.3, 4.4, true, false, 'https://images.pexels.com/photos/1199562/pexels-photo-1199562.jpeg?auto=compress&w=400', 'Among highest antioxidant vegetables. Vitamin K powerhouse.'),
    ('Quinoa', 'AncientGrain', 'AncientGrain Co.', 'grain', '1/2 cup cooked', 111, 4, 20, 1.8, 2.6, 0.9, 0, 59, 25, 30, false, 4.49, 8.7, 4.5, true, false, 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&w=400', 'Complete protein grain with all essential amino acids.'),
    ('Chia Seeds', 'TinyMighty', 'TinyMighty Health', 'fat', '2 tbsp (28g)', 138, 4.7, 12, 8.7, 9.8, 0, 0, 95, 60, 5060, false, 5.49, 9.6, 4.6, true, false, 'https://images.pexels.com/photos/4045887/pexels-photo-4045887.jpeg?auto=compress&w=400', 'Highest plant-based omega-3. Gel-forming fiber for gut.'),
    ('Almonds', 'CrunchOrchard', 'CrunchOrchard Nuts', 'fat', '28g (23 almonds)', 164, 6, 6, 14, 3.5, 1.2, 0, 76, 55, 10, false, 7.99, 8.3, 4.5, true, false, 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&w=400', 'High in vitamin E and magnesium. Reduces blood sugar.'),
    ('Mango', 'TropicGold', 'TropicGold Imports', 'fruit', '1 cup diced (165g)', 99, 1.4, 25, 0.6, 2.6, 22.5, 0, 18, 110, 30, false, 2.49, 7.8, 4.8, true, true, 'https://images.pexels.com/photos/918643/pexels-photo-918643.jpeg?auto=compress&w=400', 'High in beta-carotene and vitamin C.'),
    ('Lentils', 'LegumeLand', 'LegumeLand Co.', 'protein', '1/2 cup cooked', 115, 9, 20, 0.4, 7.8, 1.8, 0, 18, 30, 50, false, 1.79, 9.0, 4.2, true, false, 'https://images.pexels.com/photos/5409715/pexels-photo-5409715.jpeg?auto=compress&w=400', 'Excellent plant protein with high fiber and iron.'),
    ('Plain Kombucha', 'BrewCulture', 'BrewCulture Co.', 'beverage', '240ml', 30, 0, 7, 0, 0, 5, 0, 2, 35, 0, true, 3.99, 7.5, 4.1, true, true, 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&w=400', 'Fermented tea with probiotics for gut health.'),
    ('Wild Blueberry Smoothie Mix', 'BerryBurst', 'BerryBurst Farms', 'beverage', '240ml', 120, 3, 26, 1, 4, 18, 0, 10, 180, 50, false, 4.49, 8.2, 4.5, true, true, 'https://images.pexels.com/photos/1154086/pexels-photo-1154086.jpeg?auto=compress&w=400', 'High antioxidant blend for energy and recovery.');
  END IF;
END $$;
