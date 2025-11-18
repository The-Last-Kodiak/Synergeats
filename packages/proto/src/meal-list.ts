import { html, css, LitElement } from "lit";
import { property, state } from "lit/decorators.js";

type Meal = {
  name: string;
  href: string;
  imgSrc?: string;
  tags?: string;
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
        // Expecting an array of meals
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
      <section class="card" aria-labelledby="meals">
        <h2 id="meals">Menu Meals (weekly)</h2>
        <ul class="grid">
          ${this.meals.map(
            (m) => html`
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
                  ${m.tags
                    ? html`<span slot="tags">${m.tags}</span>`
                    : null}
                </sg-meal-card>
              </li>
            `
          )}
        </ul>
      </section>
    `;
  }

  static styles = css`
    :host { display:block; }
    .card {
      background: var(--color-surface-1);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-2xl);
      padding: 1rem;
    }
    h2 { margin: 0 0 .5rem 0; font-family: var(--font-display-stack); }
    ul.grid {
      list-style: none;
      margin: 0; padding: 0;
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 1rem;
    }
    li { grid-column: span 6; }
    @media (max-width: 900px) { li { grid-column: span 12; } }
  `;
}
