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
var profile_exports = {};
__export(profile_exports, {
  default: () => profile_default
});
module.exports = __toCommonJS(profile_exports);
var import_express = __toESM(require("express"));
var import_profile = require("../models/profile");
const router = import_express.default.Router();
router.get("/:userid", async (req, res) => {
  const { userid } = req.params;
  try {
    const profile = await import_profile.ProfileModel.findOne({ userid }).lean();
    if (!profile) {
      res.status(404).json({ error: `No profile for ${userid}` });
    } else {
      res.json(profile);
    }
  } catch (err) {
    console.error("Error loading profile", err);
    res.status(500).json({ error: "Server error retrieving profile" });
  }
});
router.put("/:userid", async (req, res) => {
  const { userid } = req.params;
  const {
    weightLbs,
    goal,
    gender,
    activityLevel,
    activityHours,
    dietaryPreferences,
    calories,
    proteinTarget,
    carbsTarget,
    fatTarget
  } = req.body;
  try {
    const profile = await import_profile.ProfileModel.findOneAndUpdate(
      { userid },
      {
        userid,
        weightLbs,
        goal,
        gender,
        activityLevel,
        activityHours,
        dietaryPreferences,
        calories,
        proteinTarget,
        carbsTarget,
        fatTarget
      },
      { new: true, upsert: true }
    ).lean();
    res.json(profile);
  } catch (err) {
    console.error("Error saving profile", err);
    res.status(500).json({ error: "Server error saving profile" });
  }
});
var profile_default = router;
