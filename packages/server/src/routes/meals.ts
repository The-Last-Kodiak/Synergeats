import express, { Request, Response } from "express";
import { Meal } from "../models/meal";
import Meals from "../services/meal-svc";

const router = express.Router();

/**
 * GET /api/meals
 * Get the whole collection
 */
router.get("/", (_req: Request, res: Response) => {
  const userid = (_req as any).user?.username ?? (_req as any).user?.sub;
  Meals.index(userid)
    .then((list: Meal[]) => res.json(list))
    .catch((err) => res.status(500).send(err));
});

/**
 * GET /api/meals/:id
 * Get a single meal by id (e.g. "chicken-bowl")
 */
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  Meals.get(id)
    .then((meal) => {
      if (meal) res.json(meal);
      else res.status(404).send(`${id} not found`);
    })
    .catch((err) => res.status(500).send(err));
});

/**
 * POST /api/meals
 * Create a new meal.
 * Body: JSON with at least an `id` and `name`.
 */
router.post("/", (req: Request, res: Response) => {
  const newMeal = req.body as Meal;
  const userid = (req as any).user?.username ?? (req as any).user?.sub;
  if (userid) newMeal.owner = userid;

  Meals.create(newMeal)
    .then((meal: Meal) => res.status(201).json(meal))
    .catch((err) => res.status(500).send(err));
});

/**
 * PUT /api/meals/:id
 * Replace/update a meal by id.
 * Body: JSON partial or full meal.
 */
router.put("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body as Partial<Meal>;

  Meals.update(id, updates)
    .then((meal) => {
      if (meal) res.json(meal);
      else res.status(404).send(`${id} not updated`);
    })
    .catch((err) => res.status(500).send(err));
});

/**
 * DELETE /api/meals/:id
 * Delete a meal by id.
 */
router.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  Meals.remove(id)
    .then((meal) => {
      if (meal) res.status(204).end();
      else res.status(404).send(`${id} not deleted`);
    })
    .catch((err) => res.status(500).send(err));
});

export default router;
