import { Schema, model } from "mongoose";
import { Meal } from "../models/meal";

const MealSchema = new Schema<Meal>(
  {
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    tags: [String],
    imgSrc: String
  },
  { collection: "Synergeats_meals" }
);

const MealModel = model<Meal>("Meal", MealSchema);

function index(): Promise<Meal[]> {
  return MealModel.find();
}

function get(id: string): Promise<Meal | null> {
  return MealModel.findOne({ id });
}

function create(meal: Meal): Promise<Meal> {
  return MealModel.create(meal);
}

function update(id: string, updates: Partial<Meal>): Promise<Meal | null> {
  return MealModel.findOneAndUpdate({ id }, updates, { new: true });
}

function remove(id: string): Promise<Meal | null> {
  return MealModel.findOneAndDelete({ id });
}

export default { index, get, create, update, remove };
