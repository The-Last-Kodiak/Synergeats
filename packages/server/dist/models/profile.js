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
var profile_exports = {};
__export(profile_exports, {
  ProfileModel: () => ProfileModel
});
module.exports = __toCommonJS(profile_exports);
var import_mongoose = require("mongoose");
const ProfileSchema = new import_mongoose.Schema({
  userid: { type: String, required: true, unique: true },
  weightLbs: { type: Number, required: true },
  goal: { type: String, enum: ["bulk", "maintain", "cut"], required: true },
  gender: {
    type: String,
    enum: ["male", "female", "other", "unspecified"],
    required: false
  },
  activityLevel: {
    type: String,
    enum: ["sedentary", "light", "moderate", "active", "athlete"],
    required: false
  },
  activityHours: { type: Number, required: false },
  dietaryPreferences: { type: [String], required: false, default: [] },
  calories: { type: Number, required: false },
  proteinTarget: { type: Number, required: false },
  carbsTarget: { type: Number, required: false },
  fatTarget: { type: Number, required: false }
});
const ProfileModel = (0, import_mongoose.model)("Profile", ProfileSchema);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ProfileModel
});
