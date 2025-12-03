// packages/app/src/views/meals-view.ts
import { View, define } from "@calpoly/mustang";
import { css, html } from "lit";
import type { Model } from "../model";
import type { Msg } from "../messages";
import type { Meal } from "server/models";
import { MealCardElement } from "../components/meal-card.ts";

export class MealsViewElement extends View<Model, Msg> {
  // Register components used inside this view.
  static uses = define({
    "sg-meal-card": MealCardElement
  });

  constructor() {
    // Matches provides="Synergeats:model" in index.html
    super("Synergeats:model");
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Ask the store to load meals once when the view mounts
    this.dispatchMessage(["meals/request", {}]);
  }

  render() {
    const meals: Meal[] = this.model.meals ?? [];

    return html`
      <section class="card" aria-labelledby="meals-heading">
        <h2 id="meals-heading">Menu Meals (from API)</h2>

        ${meals.length === 0
          ? html`<p>No meals loaded yet (or still loading)…</p>`
          : html`
              <ul class="list">
                ${meals.map(
                  (m) => html`
                    <li>
                      <sg-meal-card
                        img-src=${m.imgSrc ?? ""}
                        href=${`/app/meals/${m.id}`}
                        .calories=${m.calories}
                        .protein=${m.protein}
                        .carbs=${m.carbs}
                        .fat=${m.fat}
                      >
                        ${m.name}
                        ${Array.isArray(m.tags) && m.tags.length
                          ? html`<span slot="tags">
                              ${m.tags.join(" • ")}
                            </span>`
                          : null}
                      </sg-meal-card>
                    </li>
                  `
                )}
              </ul>
            `}
      </section>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    section.card {
      background: var(--color-surface-1);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-2xl);
      padding: 1.25rem 1.5rem;
    }

    h2 {
      margin: 0 0 0.75rem 0;
      font-family: var(--font-display-stack);
    }

    ul.list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    li {
      margin: 0;
      padding: 0;
    }
  `;
}
