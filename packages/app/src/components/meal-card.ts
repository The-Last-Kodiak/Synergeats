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
        ${meal.imgSrc
          ? html`<div class="thumb">
              <img src=${meal.imgSrc} alt=${meal.name} />
            </div>`
          : null}
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

        ${meal.ingredients
          ? html`<p class="ingredients">${meal.ingredients}</p>`
          : null}
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
      display: grid;
      gap: 0.75rem;
      grid-template-columns: 1fr;
      min-height: 100%;
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
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
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

    .thumb img {
      width: 100%;
      height: 160px;
      object-fit: cover;
      border-radius: 0.8rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .ingredients {
      margin: 0;
      font-size: 0.9rem;
      color: var(--color-muted, #9ea6c0);
    }
  `;
}
