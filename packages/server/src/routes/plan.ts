import express from "express";
import { PlanModel } from "../models/plan";

const router = express.Router();

// GET /api/plan
router.get("/", async (req, res) => {
  const userid = (req as any).user?.username ?? (req as any).user?.sub;
  if (!userid) return res.status(401).end();

  try {
    const plan = await PlanModel.findOne({ userid }).lean();
    if (!plan) {
      return res.json({ userid, weeklyPlan: {}, myMeals: [] });
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: "Server error retrieving plan" });
  }
});

// PUT /api/plan
router.put("/", async (req, res) => {
  const userid = (req as any).user?.username ?? (req as any).user?.sub;
  if (!userid) return res.status(401).end();

  const weeklyPlan = req.body?.weeklyPlan ?? {};
  const myMeals = Array.isArray(req.body?.myMeals)
    ? req.body.myMeals
    : [];

  try {
    const plan = await PlanModel.findOneAndUpdate(
      { userid },
      { userid, weeklyPlan, myMeals },
      { new: true, upsert: true }
    ).lean();
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: "Server error saving plan" });
  }
});

export default router;
