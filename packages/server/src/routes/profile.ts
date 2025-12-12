import express from "express";
import { ProfileModel, Profile } from "../models/profile";

const router = express.Router();

// GET /api/profile/:userid
router.get("/:userid", async (req, res) => {
  const { userid } = req.params;

  try {
    const profile = await ProfileModel.findOne({ userid }).lean();

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

// PUT /api/profile/:userid
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
  } = req.body as Partial<Profile>;

  try {
    const profile = await ProfileModel.findOneAndUpdate(
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

export default router;
