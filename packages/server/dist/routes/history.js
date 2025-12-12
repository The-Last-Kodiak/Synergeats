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
var history_exports = {};
__export(history_exports, {
  default: () => history_default
});
module.exports = __toCommonJS(history_exports);
var import_express = __toESM(require("express"));
var import_history = require("../models/history");
const router = import_express.default.Router();
router.get("/", async (req, res) => {
  const userid = req.user?.username ?? req.user?.sub;
  if (!userid) return res.status(401).end();
  try {
    const doc = await import_history.HistoryModel.findOne({ userid }).lean();
    if (!doc) return res.json({ userid, weekly: [] });
    res.json(doc);
  } catch (err) {
    console.error("Error loading history", err);
    res.status(500).json({ error: "Server error retrieving history" });
  }
});
router.put("/", async (req, res) => {
  const userid = req.user?.username ?? req.user?.sub;
  if (!userid) return res.status(401).end();
  const weekly = Array.isArray(req.body?.weekly) ? req.body.weekly : [];
  try {
    const doc = await import_history.HistoryModel.findOneAndUpdate(
      { userid },
      { userid, weekly },
      { new: true, upsert: true }
    ).lean();
    res.json(doc);
  } catch (err) {
    console.error("Error saving history", err);
    res.status(500).json({ error: "Server error saving history" });
  }
});
var history_default = router;
