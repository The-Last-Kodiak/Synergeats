// packages/app/src/views/meals-view.ts
import {
  define,
  View,
  Message,
  History,
  Auth,
  Observer
} from "@calpoly/mustang";
import { css, html } from "lit";
import { state } from "lit/decorators.js";
import type { Meal } from "server/models";
import { Model } from "../model";
import { Msg } from "../messages";
import { MealCardElement } from "../components/meal-card";

export class MealsViewElement extends View<Model, Msg> {
  static uses = define({
    "sg-meal-card": MealCardElement
  });

  private authObserver = new Observer<Auth.Model>(this, "Synergeats:auth");

  @state()
  private loggedIn = false;

  @state()
  private publicMeals: Meal[] = [];

  @state()
  private myMeals: string[] = [];

  constructor() {
    super("Synergeats:model");
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.authObserver.observe((auth) => {
      this.loggedIn = Boolean(auth.user?.authenticated);
      if (this.loggedIn) {
        const reactions: Message.Reactions = {};
        this.dispatchMessage(["meals/request", {}, reactions]);
      } else {
        this.loadPublicMeals();
      }
    });

    // initial fetch for public view
    this.loadPublicMeals();
  }

  protected updated(): void {
    // sync myMeals from plan
    this.myMeals = this.model.plan?.myMeals ?? [];
  }

  private loadPublicMeals() {
    fetch("/api/public/meals")
      .then((r) => (r.ok ? r.json() : []))
      .then((json: Meal[]) => (this.publicMeals = json ?? []))
      .catch(() => (this.publicMeals = []));
  }

  private navigate(ev: Event, href: string) {
    ev.preventDefault();
    History.dispatch(this, "history/navigate", { href });
  }

  private scrollToCatalog(ev: Event) {
    ev.preventDefault();
    const el =
      (this.renderRoot as ShadowRoot | undefined)?.querySelector("#catalog") ??
      document.getElementById("catalog");
    el?.scrollIntoView({ behavior: "smooth" });
  }

  render() {
    const meals = this.loggedIn ? this.model.meals ?? [] : this.publicMeals;

    return html`
      <main class="page">
        <header class="page-header">
          <div>
            <h2>Your meals</h2>
            <p class="hint">
              Meals you've selected for the week. Adjust your plan to change quantities.
            </p>
          </div>
          <div class="actions">
            ${this.loggedIn
              ? html`
                  <a
                    class="primary"
                    href="/app/plan"
                    @click=${(e: Event) => this.navigate(e, "/app/plan")}
                  >
                    Update plan
                  </a>
                  <a class="ghost" href="#catalog" @click=${this.scrollToCatalog}>
                    Add more meals
                  </a>
                  <a
                    class="ghost"
                    href="/app/meals/new"
                    @click=${(e: Event) => this.navigate(e, "/app/meals/new")}
                  >
                    Create new meal
                  </a>
                `
              : html`
                  <a
                    class="primary"
                    href="/app/signup"
                    @click=${(e: Event) => this.navigate(e, "/app/signup")}
                  >
                    Sign up to save meals
                  </a>
                  <a
                    class="ghost"
                    href="/app/login"
                    @click=${(e: Event) => this.navigate(e, "/app/login")}
                  >
                    Sign in
                  </a>
                `}
          </div>
        </header>

        ${this.loggedIn
          ? html`
              <section class="catalog card" id="my">
                <div class="catalog-header">
                  <h3>My meals list</h3>
                  <p class="hint">
                    Check meals to keep in your personal list. This list is shared with your plan days.
                  </p>
                </div>
                <div class="meals-list selectable">
                  ${meals.map((meal) => {
                    const id = (meal as any).id ?? (meal as any)._id;
                    const checked = this.myMeals.includes(id);
                    return html`
                      <label class="meal-select">
                        <input
                          type="checkbox"
                          ?checked=${checked}
                          @change=${(e: Event) => this.toggleMyMeal(e, id)}
                        />
                        <sg-meal-card .meal=${meal}></sg-meal-card>
                      </label>
                    `;
                  })}
                </div>
              </section>
            `
          : null}

        <section class="meals-list selected">
          ${meals.length
            ? meals.map((meal) => this.renderMeal(meal))
            : html`<p>No meals loaded yet (or still loading)...</p>`}
        </section>

        ${this.loggedIn
          ? null
          : null}
      </main>
    `;
  }

  private renderMeal(meal: Meal) {
    const id = (meal as any).id ?? (meal as any)._id;

    return html`
      <article class="meal-row">
        <a class="card-link" href="/app/meals/${id}">
          <sg-meal-card .meal=${meal}></sg-meal-card>
        </a>
        ${this.loggedIn && id && meal.owner && meal.owner !== "default"
          ? html`
              <p class="meal-actions">
                <a href="/app/meals/${id}">View</a>
                <a href="/app/meals/${id}/edit">Edit</a>
                <button
                  class="ghost"
                  @click=${(e: Event) => this.deleteMeal(e, id)}
                >
                  Delete
                </button>
              </p>
            `
          : null}
      </article>
    `;
  }

  private deleteMeal(ev: Event, id: string) {
    ev.preventDefault();
    const reactions: Message.Reactions = {};
    this.dispatchMessage(["meal/delete", { id }, reactions]);
  }

  private toggleMyMeal(ev: Event, id: string) {
    const checked = (ev.target as HTMLInputElement).checked;
    const next = checked
      ? Array.from(new Set([...this.myMeals, id]))
      : this.myMeals.filter((m) => m !== id);
    this.myMeals = next;
    const reactions: Message.Reactions = {};
    const weeklyPlan = this.model.plan?.weeklyPlan ?? {};
    this.dispatchMessage([
      "plan/save",
      { weeklyPlan, myMeals: next },
      reactions
    ]);
  }

  static styles = css`
    main.page {
      padding: 2rem 3rem;
    }

    h2 {
      margin: 0;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    a.primary,
    a.ghost {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.55rem 1rem;
      border-radius: 999px;
      font-weight: 700;
      text-decoration: none;
      border: 1px solid var(--color-border, #1c2230);
      color: inherit;
    }

    a.primary {
      background: #16a34a;
      border-color: #16a34a;
      color: #020617;
    }

    .meals-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.75rem;
      margin-bottom: 2rem;
      align-items: start;
    }

    .meal-actions {
      margin-top: 0.5rem;
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .hint {
      color: var(--color-muted, #9ea6c0);
      margin: 0.2rem 0 0;
    }

    .catalog {
      padding: 1.25rem;
      border-radius: 1.25rem;
      border: 1px solid var(--color-border, #1c2230);
      background: var(--color-surface-1, #0f172a);
      margin-top: 2rem;
    }

    .catalog-header {
      margin-bottom: 0.75rem;
    }

    .catalog h3 {
      margin: 0;
    }

    .card-link {
      color: inherit;
      text-decoration: none;
      display: block;
      height: 100%;
    }

    button.ghost {
      padding: 0.35rem 0.8rem;
      border-radius: 999px;
      border: 1px solid var(--color-border, #1c2230);
      background: transparent;
      color: inherit;
      cursor: pointer;
    }

    .meal-select {
      display: grid;
      gap: 0.4rem;
      background: var(--color-surface-2, #0f1b32);
      border: 1px solid var(--color-border, #1c2230);
      border-radius: 0.75rem;
      padding: 0.5rem;
      height: 100%;
    }

    .meal-select input {
      justify-self: start;
      width: 1.2rem;
      height: 1.2rem;
    }
  `;
}
