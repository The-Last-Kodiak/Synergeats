// packages/app/src/views/meal-detail-view.ts
import { define, View, Message } from "@calpoly/mustang";
import { css, html } from "lit";
import { property, state } from "lit/decorators.js";
import type { Meal } from "server/models";
import type { Model } from "../model";
import type { Msg } from "../messages";
import { MealCardElement } from "../components/meal-card";

export class MealDetailViewElement extends View<Model, Msg> {
  static uses = define({
    "sg-meal-card": MealCardElement
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

  connectedCallback(): void {
    super.connectedCallback();
    if (this.mealid) {
      this.dispatchMessage([
        "meal/request",
        { id: this.mealid },
        {} as Message.Reactions
      ]);
    }
  }

  render() {
    const meal = this.meal;
    if (!meal) {
      return html`
        <main class="page">
          <p>Loading meal...</p>
        </main>
      `;
    }

    return html`
      <main class="page detail">
        ${meal.imgSrc
          ? html`<div class="hero-img">
              <img src=${meal.imgSrc} alt=${meal.name} />
            </div>`
          : null}

        <section class="panel">
          <h2>${meal.name}</h2>
          <p class="tags">${(meal.tags ?? []).join(" • ")}</p>
          <div class="macros">
            <div>
              <dt>Calories</dt>
              <dd>${meal.calories}</dd>
            </div>
            <div>
              <dt>Protein</dt>
              <dd>${meal.protein} g</dd>
            </div>
            <div>
              <dt>Carbs</dt>
              <dd>${meal.carbs} g</dd>
            </div>
            <div>
              <dt>Fat</dt>
              <dd>${meal.fat} g</dd>
            </div>
          </div>
        </section>

        ${meal.ingredients
          ? html`<section class="panel">
              <h3>Ingredients</h3>
              <p>${meal.ingredients}</p>
            </section>`
          : null}
      </main>
    `;
  }

  static styles = css`
    main.page.detail {
      padding: 2rem 3rem;
      display: grid;
      gap: 1.5rem;
    }

    .hero-img {
      width: 100%;
      max-height: 200px;
      overflow: hidden;
      border-radius: 1rem;
      border: 1px solid var(--color-border, #1c2230);
    }

    .hero-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .panel {
      padding: 1.25rem;
      border-radius: 1rem;
      border: 1px solid var(--color-border, #1c2230);
      background: var(--color-surface-1, #0f1b32);
    }

    .macros {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem;
      margin-top: 0.75rem;
    }

    .macros dt {
      font-size: 0.85rem;
      color: var(--color-muted, #9ea6c0);
    }

    .macros dd {
      margin: 0;
      font-weight: 700;
    }

    .tags {
      margin: 0.25rem 0 0;
      color: var(--color-muted, #9ea6c0);
    }
  `;
}
