// packages/app/src/views/meals-view.ts
import { define, View, Message } from "@calpoly/mustang"; // <— add Message here
import { css, html } from "lit";
import type { Meal } from "server/models";

import { Model } from "../model";
import { Msg } from "../messages";
import { MealCardElement } from "../components/meal-card";

export class MealsViewElement extends View<Model, Msg> {
  static uses = define({
    "sg-meal-card": MealCardElement
  });

  constructor() {
    super("Synergeats:model");
  }

  connectedCallback(): void {
    super.connectedCallback();
    const reactions: Message.Reactions = {};
    this.dispatchMessage(["meals/request", {}, reactions]);
  }

  render() {
    const meals = this.model.meals ?? [];

    if (!meals.length) {
      return html`
        <main class="page">
          <h2>Menu Meals (from API)</h2>
          <p>No meals loaded yet (or still loading)...</p>
        </main>
      `;
    }

    return html`
      <main class="page">
        <h2>Menu Meals (from API)</h2>
        <section class="meals-list">
          ${meals.map((meal) => this.renderMeal(meal))}
        </section>
      </main>
    `;
  }

  private renderMeal(meal: Meal) {
    const id = (meal as any).id ?? (meal as any)._id;

    return html`
      <article class="meal-row">
        <sg-meal-card .meal=${meal}></sg-meal-card>
        ${id
          ? html`<p class="meal-actions">
              <a href="/app/meals/${id}/edit">Edit meal</a>
            </p>`
          : null}
      </article>
    `;
  }

  static styles = css`
    main.page {
      padding: 2rem 3rem;
    }

    h2 {
      margin-bottom: 1.5rem;
    }

    .meals-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .meal-actions {
      margin-top: 0.5rem;
      text-align: right;
    }
  `;
}
