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
    imgSrc: String,
    ingredients: String,
    owner: { type: String, default: "default" }
  },
  { collection: "Synergeats_meals" }
);

const MealModel = model<Meal>("Meal", MealSchema);

function index(userid?: string): Promise<Meal[]> {
  if (!userid) return MealModel.find({ owner: "default" });
  return MealModel.find({
    $or: [{ owner: "default" }, { owner: userid }]
  });
}

function indexDefault(): Promise<Meal[]> {
  return MealModel.find({ owner: "default" });
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

export default { index, indexDefault, get, create, update, remove };
