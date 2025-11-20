import express, { Request, Response } from "express";
import path from "path";
import { connect } from "./services/mongo";
import Meals from "./services/meal-svc";

// Node gives __dirname in CJS output.
// In ESBuild-generated CJS, __dirname works automatically.
const staticDir = process.env.STATIC || path.resolve(__dirname, "../../proto/public");

const app = express();
const port = process.env.PORT || 3000;

console.log("Serving static files from:", staticDir);
app.use(express.static(staticDir));

// Test route
app.get("/hello", (_req: Request, res: Response) => {
  res.send("Hello from Express!");
});

// API route
app.get("/api/meals", async (_req: Request, res: Response) => {
  try {
    const items = await Meals.index();
    res.json(items);
  } catch (err) {
    res.status(500).send({ error: "Database error" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

connect("Synergeats");
