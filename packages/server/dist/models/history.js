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
var history_exports = {};
__export(history_exports, {
  HistoryModel: () => HistoryModel
});
module.exports = __toCommonJS(history_exports);
var import_mongoose = require("mongoose");
const HistorySchema = new import_mongoose.Schema({
  userid: { type: String, required: true, unique: true },
  weekly: [
    {
      day: String,
      completed: Number,
      total: Number,
      weight: Number,
      date: String
    }
  ]
});
const HistoryModel = (0, import_mongoose.model)(
  "History",
  HistorySchema,
  "UserHistory"
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HistoryModel
});
