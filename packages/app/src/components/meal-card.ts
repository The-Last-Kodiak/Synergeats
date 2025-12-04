// packages/app/src/components/meal-card.ts
import { LitElement, css, html } from "lit";
import { property } from "lit/decorators.js";
import type { Meal } from "server/models";

export class MealCardElement extends LitElement {
  @property({ type: Object })
  meal?: Meal;

  render() {
    const meal = this.meal;
    if (!meal) return html``;

    return html`
      <article class="card">
        <header>
          <h3>${meal.name}</h3>
          ${meal.tags?.length
            ? html`<p class="tags">
                ${meal.tags.join(" • ")}
              </p>`
            : null}
        </header>

        <dl class="macros">
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
        </dl>
      </article>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .card {
      padding: 1.5rem 2rem;
      border-radius: 1rem;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    h3 {
      font-size: 1.4rem;
      margin: 0;
    }

    .tags {
      margin: 0.25rem 0 0;
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .macros {
      display: flex;
      gap: 2.5rem;
      margin: 0;
    }

    .macros div {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    dt {
      font-size: 0.8rem;
      text-transform: uppercase;
      opacity: 0.7;
    }

    dd {
      margin: 0;
      font-weight: 600;
    }
  `;
}
