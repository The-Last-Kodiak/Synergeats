// packages/app/src/views/plan-view.ts
import { define, View, Message, History } from "@calpoly/mustang";
import { css, html, PropertyValues } from "lit";
import { state } from "lit/decorators.js";
import type { Profile } from "server/models";
import type { Model } from "../model";
import type { Msg } from "../messages";
import { MealCardElement } from "../components/meal-card";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
type Day = (typeof DAYS)[number];

const emptySchedule = (): Record<Day, string[]> => ({
  Sun: [],
  Mon: [],
  Tue: [],
  Wed: [],
  Thu: [],
  Fri: [],
  Sat: []
});

export class PlanViewElement extends View<Model, Msg> {
  static uses = define({
    "sg-meal-card": MealCardElement
  });

  @state()
  private selectedDay: Day = "Sun";

  @state()
  private schedule: Record<Day, string[]> = emptySchedule();

  @state()
  private myMeals: string[] = [];

  private planSnapshot = "";

  private navigate(ev: Event, href: string) {
    ev.preventDefault();
    History.dispatch(this, "history/navigate", { href });
  }

  constructor() {
    super("Synergeats:model");
  }

  connectedCallback(): void {
    super.connectedCallback();
    const reactions: Message.Reactions = {};
    this.dispatchMessage(["profile/request", {}, reactions]);
    this.dispatchMessage(["meals/request", {}, reactions]);
    this.dispatchMessage(["plan/request", {}, reactions]);
  }

  protected updated(_changed: PropertyValues<this>): void {
    const plan = this.model.plan?.weeklyPlan ?? {};
    const key = JSON.stringify(plan);
    if (key !== this.planSnapshot) {
      this.planSnapshot = key;
      this.schedule = this.mergeWithDefaults(plan);
      this.myMeals = this.model.plan?.myMeals ?? [];
    }
  }

  private mergeWithDefaults(plan: Record<string, string[]>): Record<Day, string[]> {
    const base = emptySchedule();
    Object.entries(plan ?? {}).forEach(([day, meals]) => {
      if (day in base) {
        base[day as Day] = Array.isArray(meals) ? [...meals] : [];
      }
    });
    return base;
  }

  render() {
    const meals = this.model.meals ?? [];
    const profile: Profile | undefined = this.model.profile;

    return html`
      <main class="page">
        <header class="page-header">
          <div>
            <p class="eyebrow">Plan & schedule</p>
            <h1>Your weekly plan</h1>
            <p class="hint">
              Pick meals for each day, then save to your account. Defaults and your meals are all shown here.
            </p>
          </div>
          <div class="summary card">
            <h3>Macros</h3>
            <dl class="stats">
              <div>
                <dt>Calories</dt>
                <dd>${profile?.calories ?? "—"}</dd>
              </div>
              <div>
                <dt>Protein</dt>
                <dd>${profile?.proteinTarget ?? "—"} g</dd>
              </div>
              <div>
                <dt>Carbs</dt>
                <dd>${profile?.carbsTarget ?? "—"} g</dd>
              </div>
              <div>
                <dt>Fat</dt>
                <dd>${profile?.fatTarget ?? "—"} g</dd>
              </div>
            </dl>
          </div>
        </header>

        <section class="note card">
          <h3>Meal list</h3>
          <p class="hint">
            Your schedule uses the meals you've marked as "My meals" on the Meals page.
            Edit that list there, then return to assign days.
          </p>
          <a class="ghost" href="/app/meals" @click=${(e: Event) => this.navigate(e, "/app/meals")}>Go to Meals</a>
        </section>

      <section class="schedule card">
        <div class="days">
          ${DAYS.map(
            (d) => html`
              <button
                  class=${d === this.selectedDay ? "pill active" : "pill"}
                  @click=${() => (this.selectedDay = d)}
                >
                  ${d}
                </button>
              `
            )}
          </div>

          <div class="day-editor">
            <h3>Meals for ${this.selectedDay}</h3>
            <p class="hint">Select meals to include for this day.</p>
            ${this.availableMeals(meals).length
              ? html`
                  <div class="meal-grid selectable tightened">
                    ${this.availableMeals(meals).map((meal) => {
                      const id = (meal as any).id ?? (meal as any)._id;
                      const checked =
                        this.schedule[this.selectedDay]?.includes(id);
                      return html`
                        <label class="meal-select">
                          <input
                            type="checkbox"
                            ?checked=${checked}
                            @change=${(e: Event) =>
                              this.toggleMeal(e, this.selectedDay, id)}
                          />
                          <sg-meal-card .meal=${meal}></sg-meal-card>
                        </label>
                      `;
                    })}
                  </div>
                `
              : html`<p class="hint">
                  No meals selected yet. Pick some in “My meals list” above.
                </p>`}

            <div class="actions">
              <button class="ghost" @click=${this.applyToAll}>
                Apply this day to all
              </button>
              <button class="primary" @click=${this.saveSchedule}>
                Save schedule
              </button>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  private toggleMeal(ev: Event, day: Day, id: string) {
    const checked = (ev.target as HTMLInputElement).checked;
    const current = this.schedule[day] ?? [];
    const next = checked
      ? Array.from(new Set([...current, id]))
      : current.filter((m) => m !== id);
    this.schedule = {
      ...this.schedule,
      [day]: next
    };
  }

  private applyToAll = () => {
    const dayMeals = this.schedule[this.selectedDay] ?? [];
    const next = emptySchedule();
    DAYS.forEach((d) => {
      next[d] = [...dayMeals];
    });
    this.schedule = next;
  };

  private saveSchedule = () => {
    const combinedMyMeals =
      this.myMeals.length > 0
        ? this.myMeals
        : Array.from(
            new Set(
              Object.values(this.schedule)
                .flat()
                .filter(Boolean)
            )
          );
    const reactions: Message.Reactions = {};
    this.dispatchMessage([
      "plan/save",
      { weeklyPlan: this.schedule, myMeals: combinedMyMeals },
      reactions
    ]);
  };

  private availableMeals(all: any[]) {
    if (!this.myMeals.length) return all;
    return all.filter((m: any) => {
      const id = m?.id ?? m?._id;
      return this.myMeals.includes(id);
    });
  }

  static styles = css`
    main.page {
      padding: 2rem 3rem;
      display: grid;
      gap: 1.5rem;
    }

    .page-header {
      display: grid;
      gap: 1rem;
      grid-template-columns: 2fr 1fr;
      align-items: start;
    }

    @media (max-width: 900px) {
      .page-header {
        grid-template-columns: 1fr;
      }
    }

    .eyebrow {
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 0.8rem;
      color: var(--color-muted, #9ea6c0);
      margin: 0 0 0.3rem 0;
    }

    .hint {
      color: var(--color-muted, #9ea6c0);
      margin: 0.2rem 0 0;
    }

    .summary {
      border: 1px solid var(--color-border, #1c2230);
      border-radius: 1rem;
      padding: 1rem;
      background: var(--color-surface-1, #0f172a);
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 0.6rem;
      margin: 0.5rem 0 0;
      padding: 0;
    }

    .stats dt {
      font-size: 0.85rem;
      color: var(--color-muted, #9ea6c0);
    }

    .stats dd {
      margin: 0;
      font-weight: 700;
    }

    .suggestions {
      display: grid;
      gap: 0.75rem;
    }

    .meal-grid {
      display: grid;
      gap: 1.25rem;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      grid-auto-rows: 1fr;
      align-items: start;
    }

    .meal-grid.tightened {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .schedule {
      display: grid;
      gap: 1.25rem;
      background: var(--color-surface-1, #0f172a);
      border: 1px solid var(--color-border, #1c2230);
      border-radius: 1rem;
      padding: 1rem;
    }

    .days {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .pill {
      padding: 0.5rem 0.9rem;
      border-radius: 999px;
      border: 1px solid var(--color-border, #1c2230);
      background: rgba(255, 255, 255, 0.04);
      color: inherit;
      cursor: pointer;
    }

    .pill.active {
      background: var(--color-accent-2, #16a34a);
      color: var(--color-text-inverted, #020617);
      border-color: var(--color-accent-2, #16a34a);
    }

    .day-editor {
      display: grid;
      gap: 0.75rem;
    }

    .meal-grid.selectable {
      background: var(--color-surface-2, #0f1b32);
      padding: 0.75rem;
      border-radius: 1rem;
      border: 1px solid var(--color-border, #1c2230);
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

    .meal-select sg-meal-card {
      display: block;
      height: 100%;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    button.primary,
    button.ghost {
      padding: 0.6rem 1.2rem;
      border-radius: 999px;
      border: 1px solid var(--color-border, #1c2230);
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-weight: 700;
    }

    button.primary {
      background: var(--color-accent-2, #16a34a);
      color: var(--color-text-inverted, #020617);
      border-color: var(--color-accent-2, #16a34a);
    }
  `;
}
