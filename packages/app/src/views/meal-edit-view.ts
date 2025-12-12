// packages/app/src/views/meal-edit-view.ts
import { History, View, Message } from "@calpoly/mustang";
import { css, html } from "lit";
import { property, state } from "lit/decorators.js";
import type { Meal } from "server/models";

import type { Model } from "../model";
import type { Msg } from "../messages";

export class MealEditViewElement extends View<Model, Msg> {
  @property({ attribute: "meal-id" })
  mealid?: string;

  @state()
  get meal(): Meal | undefined {
    return this.model.selectedMeal;
  }

  constructor() {
    super("Synergeats:model");
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.mealid) {
      this.dispatchMessage([
        "meal/request",
        { id: this.mealid },
        {} as Message.Reactions
      ]);
    }
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === "meal-id" && newValue && newValue !== oldValue) {
      this.dispatchMessage([
        "meal/request",
        { id: newValue },
        {} as Message.Reactions
      ]);
    }
  }

  render() {
    const meal = this.meal;

    if (!meal) {
      return html`
        <main class="page">
          <h2>Edit Meal</h2>
          <p>Loading meal data...</p>
        </main>
      `;
    }

    return html`
      <main class="page">
        <h2>Edit meal: ${meal.name}</h2>

        <form class="card" @submit=${this.handleSubmit}>
          <label>
            <span>Name</span>
            <input name="name" .value=${meal.name ?? ""} required />
          </label>

          <div class="grid">
            <label>
              <span>Calories</span>
              <input
                type="number"
                name="calories"
                .value=${String(meal.calories ?? "")}
                required
              />
            </label>

            <label>
              <span>Protein (g)</span>
              <input
                type="number"
                name="protein"
                .value=${String(meal.protein ?? "")}
                required
              />
            </label>

            <label>
              <span>Carbs (g)</span>
              <input
                type="number"
                name="carbs"
                .value=${String(meal.carbs ?? "")}
                required
              />
            </label>

            <label>
              <span>Fat (g)</span>
              <input
                type="number"
                name="fat"
                .value=${String(meal.fat ?? "")}
                required
              />
            </label>
          </div>

          <label>
            <span>Ingredients</span>
            <textarea
              name="ingredients"
              rows="2"
              .value=${meal.ingredients ?? ""}
            ></textarea>
          </label>

          <label>
            <span>Tags (comma-separated)</span>
            <input
              name="tags"
              .value=${(meal.tags ?? []).join(", ")}
              placeholder="High-Protein, Gluten-Free"
            />
          </label>

          <label>
            <span>Image URL</span>
            <input
              name="imgSrc"
              .value=${meal.imgSrc ?? ""}
              placeholder="/images/meals/chicken.jpg"
            />
          </label>

          <div class="buttons">
            <button type="submit" class="primary">Save meal</button>
            <button type="button" class="ghost" @click=${this.handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </main>
    `;
  }

  handleSubmit = (event: Event) => {
    event.preventDefault();
    if (!this.mealid) return;

    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const rawTags = (data.get("tags") as string) ?? "";
    const meal: Meal = {
      id: this.mealid,
      name: String(data.get("name") ?? ""),
      calories: Number(data.get("calories") ?? 0),
      protein: Number(data.get("protein") ?? 0),
      carbs: Number(data.get("carbs") ?? 0),
      fat: Number(data.get("fat") ?? 0),
      tags: rawTags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      imgSrc: String(data.get("imgSrc") ?? "").trim() || undefined,
      ingredients: String(data.get("ingredients") ?? "").trim() || undefined
    };

    this.dispatchMessage([
      "meal/save",
      { id: this.mealid, meal },
      {
        onSuccess: () =>
          History.dispatch(this, "history/navigate", {
            href: "/app/meals"
          }),
        onFailure: (error: Error) =>
          console.error("ERROR saving meal:", error)
      }
    ]);
  };

  private handleCancel = (event: Event) => {
    event.preventDefault();
    History.dispatch(this, "history/navigate", { href: "/app/meals" });
  };

  static styles = css`
    main.page {
      padding: 2rem 3rem;
      max-width: 48rem;
    }

    form.card {
      display: grid;
      gap: 1rem;
      background: var(--color-surface-2, #0f1b32);
      border: 1px solid var(--color-border, #1c2230);
      border-radius: 1rem;
      padding: 1.25rem;
    }

    .grid {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    input,
    textarea {
      padding: 0.5rem 0.7rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(0, 0, 0, 0.2);
      color: inherit;
    }

    .buttons {
      margin-top: 1rem;
      display: flex;
      gap: 0.75rem;
    }

    button.primary,
    button.ghost {
      padding: 0.55rem 1rem;
      border-radius: 999px;
      border: 1px solid var(--color-border, #1c2230);
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-weight: 700;
    }

    button.primary {
      background: var(--color-accent-2, #16a34a);
      color: var(--color-text-inverted, #020617);
      border-color: var(--color-accent-2, #16a34a);
    }
  `;
}
