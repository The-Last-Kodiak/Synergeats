// src/meal-list.ts
import { html, css, LitElement } from "lit";
import { property, state } from "lit/decorators.js";

type Meal = {
  name: string;
  href: string;
  imgSrc?: string;
  tags?: string[] | string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

export class MealListElement extends LitElement {
  @property() src?: string;

  @state() private meals: Meal[] = [];

  connectedCallback(): void {
    super.connectedCallback();
    if (this.src) this.hydrate(this.src);
  }

  private hydrate(src: string) {
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: unknown) => {
        if (Array.isArray(json)) {
          this.meals = json as Meal[];
        } else {
          console.warn("Expected an array in JSON:", json);
          this.meals = [];
        }
      })
      .catch((err) => console.error("Failed to load meals:", err));
  }

  override render() {
    return html`
      <section class="card" aria-labelledby="meals-heading">
        <h2 id="meals-heading">Menu Meals (weekly)</h2>
        <ul class="list">
          ${this.meals.map((m) => {
            const tags =
              Array.isArray(m.tags) ? m.tags.join(" • ") : m.tags ?? "";
            return html`
              <li>
                <sg-meal-card
                  img-src=${m.imgSrc ?? ""}
                  href=${m.href ?? "#"}
                  .calories=${m.calories ?? undefined}
                  .protein=${m.protein ?? undefined}
                  .carbs=${m.carbs ?? undefined}
                  .fat=${m.fat ?? undefined}
                >
                  ${m.name}
                  ${tags
                    ? html`<span slot="tags">${tags}</span>`
                    : null}
                </sg-meal-card>
              </li>
            `;
          })}
        </ul>
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
