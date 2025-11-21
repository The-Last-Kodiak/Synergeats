// src/meal-list.ts
import { html, css, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import { Auth, Observer } from "@calpoly/mustang";

type Meal = {
  id?: string;
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

  // Auth observer for JWT token access
  private _authObserver = new Observer<Auth.Model>(this, "Synergeats:auth");
  private _user?: Auth.User;

  connectedCallback(): void {
    super.connectedCallback();

    // Watch authentication state
    this._authObserver.observe((auth: Auth.Model) => {
      this._user = auth.user;
      if (this.src) this.hydrate(this.src); // reload data when auth changes
    });

    if (this.src) this.hydrate(this.src);
  }

  /**
   * Returns an Authorization header if logged in, otherwise undefined
   */
  get authorization(): HeadersInit | undefined {
    if (
      this._user &&
      this._user.authenticated &&
      "token" in this._user
    ) {
      return {
        Authorization: `Bearer ${this._user.token}`
      };
    }
    return undefined;
  }

  /**
   * Fetch the meals from the API using auth headers
   */
  private hydrate(src: string) {
    fetch(src, {
      headers: this.authorization
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: unknown) => {
        if (Array.isArray(json)) {
          this.meals = json.map((m: any) => ({
            ...m,
            tags: Array.isArray(m.tags)
              ? m.tags.join(" • ")
              : m.tags
          })) as Meal[];
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
          ${this.meals.map((m) => html`
            <li>
              <sg-meal-card
                img-src=${m.imgSrc ?? ""}
                href=${m.href ?? "#"}
                .calories=${m.calories}
                .protein=${m.protein}
                .carbs=${m.carbs}
                .fat=${m.fat}
              >
                ${m.name}
                ${m.tags
                  ? html`<span slot="tags">${m.tags}</span>`
                  : null}
              </sg-meal-card>
            </li>
          `)}
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
