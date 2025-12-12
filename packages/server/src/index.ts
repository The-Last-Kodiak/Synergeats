import express from "express";
import path from "path";
import { connect } from "./services/mongo";
import auth, { authenticateUser } from "./routes/auth";
import meals from "./routes/meals";
import mealsPublic from "./routes/meals-public";
import profile from "./routes/profile";
import plan from "./routes/plan";
import history from "./routes/history";

const app = express();
const port = process.env.PORT || 3000;

// use env var if set, otherwise default to proto/dist
const staticDir = path.resolve(
  __dirname,
  "..",
  process.env.STATIC ?? "../proto/dist"
);

console.log("Serving static files from:", staticDir);
app.use(express.static(staticDir));

// JSON body parser for REST APIs
app.use(express.json());

// Simple test route from Lab 10
app.get("/hello", (_req, res) => {
  res.send("Hello from Express!");
});

// Mount REST APIs
app.use("/auth", auth);
app.use("/api/public/meals", mealsPublic);
app.use("/api/meals", authenticateUser, meals);
app.use("/api/profile", authenticateUser, profile);
app.use("/api/plan", authenticateUser, plan);
app.use("/api/history", authenticateUser, history);

// SPA history fallback for /app routes
app.get(["/app", "/app/*"], (_req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Connect to MongoDB Atlas
connect("Synergeats");
