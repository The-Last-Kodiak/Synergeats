"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var import_express = __toESM(require("express"));
var import_path = __toESM(require("path"));
var import_mongo = require("./services/mongo");
var import_auth = __toESM(require("./routes/auth"));
var import_meals = __toESM(require("./routes/meals"));
const app = (0, import_express.default)();
const port = process.env.PORT || 3e3;
const staticDir = import_path.default.resolve(__dirname, "../../proto/dist");
console.log("Serving static files from:", staticDir);
app.use(import_express.default.static(staticDir));
app.use(import_express.default.json());
app.get("/hello", (_req, res) => {
  res.send("Hello from Express!");
});
app.use("/auth", import_auth.default);
app.use("/api/meals", import_auth.authenticateUser, import_meals.default);
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
(0, import_mongo.connect)("Synergeats");
