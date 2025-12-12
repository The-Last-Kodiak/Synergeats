import express from "express";
import { HistoryModel } from "../models/history";

const router = express.Router();

// GET /api/history
router.get("/", async (req, res) => {
  const userid = (req as any).user?.username ?? (req as any).user?.sub;
  if (!userid) return res.status(401).end();

  try {
    const doc = await HistoryModel.findOne({ userid }).lean();
    if (!doc) return res.json({ userid, weekly: [] });
    res.json(doc);
  } catch (err) {
    console.error("Error loading history", err);
    res.status(500).json({ error: "Server error retrieving history" });
  }
});

// PUT /api/history
router.put("/", async (req, res) => {
  const userid = (req as any).user?.username ?? (req as any).user?.sub;
  if (!userid) return res.status(401).end();

  const weekly = Array.isArray(req.body?.weekly) ? req.body.weekly : [];
  try {
    const doc = await HistoryModel.findOneAndUpdate(
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

export default router;
