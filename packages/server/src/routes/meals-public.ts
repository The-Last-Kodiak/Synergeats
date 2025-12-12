import express, { Request, Response } from "express";
import { Meal } from "../models/meal";
import Meals from "../services/meal-svc";

const router = express.Router();

// GET /api/public/meals
router.get("/", (_req: Request, res: Response) => {
  Meals.indexDefault()
    .then((list: Meal[]) => res.json(list))
    .catch((err) => res.status(500).send(err));
});

// GET /api/public/meals/:id (default only)
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  Meals.get(id)
    .then((meal) => {
      if (meal && meal.owner === "default") res.json(meal);
      else res.status(404).send(`${id} not found`);
    })
    .catch((err) => res.status(500).send(err));
});

export default router;
