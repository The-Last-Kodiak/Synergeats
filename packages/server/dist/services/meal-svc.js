"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var meal_svc_exports = {};
__export(meal_svc_exports, {
  default: () => meal_svc_default
});
module.exports = __toCommonJS(meal_svc_exports);
var import_mongoose = require("mongoose");
const MealSchema = new import_mongoose.Schema(
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
const MealModel = (0, import_mongoose.model)("Meal", MealSchema);
function index() {
  return MealModel.find();
}
function get(id) {
  return MealModel.findOne({ id });
}
function create(meal) {
  return MealModel.create(meal);
}
function update(id, updates) {
  return MealModel.findOneAndUpdate({ id }, updates, { new: true });
}
function remove(id) {
  return MealModel.findOneAndDelete({ id });
}
var meal_svc_default = { index, get, create, update, remove };
