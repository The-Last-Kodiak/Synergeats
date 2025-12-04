// packages/app/src/views/meal-edit-view.ts
import { define, Form, History, View, Message } from "@calpoly/mustang";
import { css, html } from "lit";
import { property, state } from "lit/decorators.js";
import type { Meal } from "server/models";

import type { Model } from "../model";
import type { Msg } from "../messages";

export class MealEditViewElement extends View<Model, Msg> {
  static uses = define({
    "mu-form": Form.Element
  });

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

        <mu-form .init=${meal} @mu-form:submit=${this.handleSubmit}>
          <label>
            <span>Name</span>
            <input name="name" .value=${meal.name ?? ""} />
          </label>

          <label>
            <span>Calories</span>
            <input
              type="number"
              name="calories"
              .value=${String(meal.calories ?? "")}
            />
          </label>

          <label>
            <span>Protein (g)</span>
            <input
              type="number"
              name="protein"
              .value=${String(meal.protein ?? "")}
            />
          </label>

          <label>
            <span>Carbs (g)</span>
            <input
              type="number"
              name="carbs"
              .value=${String(meal.carbs ?? "")}
            />
          </label>

          <label>
            <span>Fat (g)</span>
            <input
              type="number"
              name="fat"
              .value=${String(meal.fat ?? "")}
            />
          </label>

          <div class="buttons">
            <button type="submit">Save meal</button>
          </div>
        </mu-form>
      </main>
    `;
  }

  handleSubmit = (event: Form.SubmitEvent<Meal>) => {
    event.preventDefault?.();
    if (!this.mealid) return;

    this.dispatchMessage([
      "meal/save",
      {
        id: this.mealid,
        meal: event.detail
      },
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


  static styles = css`
    main.page {
      padding: 2rem 3rem;
      max-width: 48rem;
    }

    mu-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    label span {
      font-weight: 600;
    }

    input {
      padding: 0.5rem 0.7rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(0, 0, 0, 0.2);
      color: inherit;
    }

    .buttons {
      margin-top: 1rem;
    }
  `;
}
