"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var plan_exports = {};
__export(plan_exports, {
  default: () => plan_default
});
module.exports = __toCommonJS(plan_exports);
var import_express = __toESM(require("express"));
var import_plan = require("../models/plan");
const router = import_express.default.Router();
router.get("/", async (req, res) => {
  const userid = req.user?.username ?? req.user?.sub;
  if (!userid) return res.status(401).end();
  try {
    const plan = await import_plan.PlanModel.findOne({ userid }).lean();
    if (!plan) {
      return res.json({ userid, weeklyPlan: {}, myMeals: [] });
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: "Server error retrieving plan" });
  }
});
router.put("/", async (req, res) => {
  const userid = req.user?.username ?? req.user?.sub;
  if (!userid) return res.status(401).end();
  const weeklyPlan = req.body?.weeklyPlan ?? {};
  const myMeals = Array.isArray(req.body?.myMeals) ? req.body.myMeals : [];
  try {
    const plan = await import_plan.PlanModel.findOneAndUpdate(
      { userid },
      { userid, weeklyPlan, myMeals },
      { new: true, upsert: true }
    ).lean();
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: "Server error saving plan" });
  }
});
var plan_default = router;
