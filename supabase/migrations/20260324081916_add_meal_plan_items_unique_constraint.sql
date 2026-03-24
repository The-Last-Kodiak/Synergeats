/*
  # Add unique constraint to meal_plan_items
  Allows upsert operations on meal_plan_id + food_id + meal_time
*/
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'meal_plan_items_plan_food_meal_key'
  ) THEN
    ALTER TABLE meal_plan_items ADD CONSTRAINT meal_plan_items_plan_food_meal_key
      UNIQUE (meal_plan_id, food_id, meal_time);
  END IF;
END $$;
