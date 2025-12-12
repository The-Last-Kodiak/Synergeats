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
var plan_exports = {};
__export(plan_exports, {
  PlanModel: () => PlanModel
});
module.exports = __toCommonJS(plan_exports);
var import_mongoose = require("mongoose");
const PlanSchema = new import_mongoose.Schema({
  userid: { type: String, required: true, unique: true },
  weeklyPlan: { type: import_mongoose.Schema.Types.Mixed, required: true },
  myMeals: { type: [String], default: [] }
});
const PlanModel = (0, import_mongoose.model)("Plan", PlanSchema, "UserPlans");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PlanModel
});
