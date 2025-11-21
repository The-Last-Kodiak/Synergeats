import express from "express";
import path from "path";
import { connect } from "./services/mongo";
import auth, { authenticateUser } from "./routes/auth";
import meals from "./routes/meals";


const app = express();
const port = process.env.PORT || 3000;

// Static files (built proto)
const staticDir = path.resolve(__dirname, "../../proto/dist");
console.log("Serving static files from:", staticDir);
app.use(express.static(staticDir));

// 🔹 JSON body parser for REST APIs
app.use(express.json());

// Simple test route from Lab 10
app.get("/hello", (_req, res) => {
  res.send("Hello from Express!");
});

// 🔹 Mount the Meals REST API
app.use("/auth", auth);
app.use("/api/meals", authenticateUser, meals);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Connect to MongoDB Atlas
connect("Synergeats");
