// packages/app/src/views/onboarding-view.ts
import { Auth, History, Observer, View, Message } from "@calpoly/mustang";
import { css, html } from "lit";
import { state } from "lit/decorators.js";
import type { Model } from "../model";
import type { Msg } from "../messages";
import type { Gender, Goal } from "server/models";
import { estimateMacros } from "../utils/macros";

type Step = 0 | 1 | 2;

export class OnboardingViewElement extends View<Model, Msg> {
  private authObserver = new Observer<Auth.Model>(this, "Synergeats:auth");

  @state()
  private step: Step = 0;

  @state()
  private form: {
    weightLbs?: number;
    goal?: Goal;
    gender?: Gender;
    activityLevel?: string;
    activityHours?: number;
    dietaryPreferences: string[];
  } = { dietaryPreferences: [] };

  constructor() {
    super("Synergeats:model");
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.authObserver.observe(() => {});

    const saved = localStorage.getItem("synergeats:onboarding");
    if (saved) {
      try {
        this.form = JSON.parse(saved);
      } catch {
        // ignore
      }
    }
  }

  private setField(name: string, value: string | number | string[]) {
    this.form = {
      ...this.form,
      [name]: value
    };
  }

  private togglePref(tag: string, checked: boolean) {
    const current = this.form.dietaryPreferences ?? [];
    this.form = {
      ...this.form,
      dietaryPreferences: checked
        ? [...current, tag]
        : current.filter((t) => t !== tag)
    };
  }

  private next = (ev: Event) => {
    ev.preventDefault();
    const next = Math.min(2, this.step + 1) as Step;
    this.step = next;
  };

  private back = (ev: Event) => {
    ev.preventDefault();
    const prev = Math.max(0, this.step - 1) as Step;
    this.step = prev;
  };

  private finish = (ev: Event) => {
    ev.preventDefault();

    const weightLbs = this.form.weightLbs ?? 0;
    const goal = (this.form.goal ?? "maintain") as Goal;
    const gender = (this.form.gender ?? "unspecified") as Gender;
    const activityHours = this.form.activityHours ?? 0;

    const estimates = weightLbs
      ? estimateMacros({ weightLbs, goal, gender, activityHours })
      : undefined;
    const payload = {
      weightLbs,
      goal,
      gender,
      activityHours,
      dietaryPreferences: this.form.dietaryPreferences,
      ...estimates
    };

    localStorage.setItem("synergeats:onboarding", JSON.stringify(payload));

    const reactions: Message.Reactions = {
      onSuccess: () =>
        History.dispatch(this, "history/navigate", { href: "/app" }),
      onFailure: () =>
        History.dispatch(this, "history/navigate", { href: "/app/signup" })
    };

    this.dispatchMessage(["profile/save", payload, reactions]);
  };

  render() {
    const macros =
      this.form.weightLbs && this.form.goal
        ? estimateMacros({
            weightLbs: this.form.weightLbs,
            goal: this.form.goal,
            gender: this.form.gender,
            activityHours: this.form.activityHours
          })
        : undefined;

    return html`
      <main class="page">
        <p class="eyebrow">Onboarding</p>
        <h1>Let’s configure your nutrition</h1>
        <p class="lede">
          This quick setup gathers your diet, goals, and activity so we can
          recommend a weekly plan.
        </p>

        <section class="card wizard">
          <header class="steps">
            <span class=${this.step === 0 ? "active" : ""}>Diet</span>
            <span class=${this.step === 1 ? "active" : ""}>Goals</span>
            <span class=${this.step === 2 ? "active" : ""}>Review</span>
          </header>

          ${this.step === 0 ? this.renderDiet() : null}
          ${this.step === 1 ? this.renderGoals() : null}
          ${this.step === 2 ? this.renderReview(macros) : null}

          <footer class="nav">
            ${this.step > 0
              ? html`<button class="ghost" @click=${this.back}>Back</button>`
              : html`<span></span>`}
            ${this.step < 2
              ? html`<button class="primary" @click=${this.next}>
                  Next
                </button>`
              : html`<button class="primary" @click=${this.finish}>
                  Save and continue
                </button>`}
          </footer>
        </section>
      </main>
    `;
  }

  private renderDiet() {
    const prefs = this.form.dietaryPreferences ?? [];
    return html`
      <div class="panel">
        <h3>Dietary preferences</h3>
        <p class="hint">Pick all that apply to filter your menu.</p>
        <div class="chips">
          ${["vegetarian", "vegan", "gluten-free", "dairy-free", "high-protein"]
            .map((tag) => {
              const checked = prefs.includes(tag);
              return html`
                <label class=${checked ? "chip active" : "chip"}>
                  <input
                    type="checkbox"
                    .checked=${checked}
                    @change=${(e: Event) =>
                      this.togglePref(tag, (e.target as HTMLInputElement)
                        ?.checked ?? false)}
                  />
                  ${tag}
                </label>
              `;
            })}
        </div>
      </div>
    `;
  }

  private renderGoals() {
    return html`
      <div class="panel grid">
        <label>
          <span>Goal</span>
          <select
            @change=${(e: Event) =>
            this.setField("goal", (e.target as HTMLSelectElement)?.value)}
            .value=${this.form.goal ?? "maintain"}
          >
            <option value="bulk">Bulk (gain)</option>
            <option value="maintain">Maintain</option>
            <option value="cut">Cut (lose fat)</option>
          </select>
        </label>

        <label>
          <span>Weight (lb)</span>
          <input
            type="number"
            min="80"
            max="400"
            .value=${String(this.form.weightLbs ?? "")}
            @input=${(e: Event) =>
              this.setField(
                "weightLbs",
                Number((e.target as HTMLInputElement)?.value ?? 0)
              )}
          />
        </label>

        <label>
          <span>Gender</span>
          <select
            @change=${(e: Event) =>
              this.setField(
                "gender",
                ((e.target as HTMLSelectElement)?.value ??
                  "unspecified") as Gender
              )}
            .value=${this.form.gender ?? "unspecified"}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="unspecified">Prefer not to say</option>
          </select>
        </label>

        <label>
          <span>Activity (hours/week)</span>
          <input
            type="number"
            min="0"
            max="30"
            step="0.5"
            .value=${String(this.form.activityHours ?? "")}
            @input=${(e: Event) =>
              this.setField(
                "activityHours",
                Number((e.target as HTMLInputElement)?.value ?? 0)
              )}
          />
        </label>
      </div>
    `;
  }

  private renderReview(macros?: ReturnType<typeof estimateMacros>) {
    return html`
      <div class="panel review">
        <h3>Estimated macros</h3>
        ${macros
          ? html`
              <dl class="macros">
                <div>
                  <dt>Calories</dt>
                  <dd>${macros.calories} kcal</dd>
                </div>
                <div>
                  <dt>Protein</dt>
                  <dd>${macros.proteinTarget} g</dd>
                </div>
                <div>
                  <dt>Carbs</dt>
                  <dd>${macros.carbsTarget} g</dd>
                </div>
                <div>
                  <dt>Fat</dt>
                  <dd>${macros.fatTarget} g</dd>
                </div>
              </dl>
            `
          : html`<p class="hint">Enter a weight and goal to see your numbers.</p>`}
        <p class="hint">
          We'll save these to your profile so you can tweak them later.
        </p>
        <ul class="summary">
          <li>Goal: ${this.form.goal ?? "maintain"}</li>
          <li>Weight: ${this.form.weightLbs ?? "—"} lb</li>
          <li>Activity: ${this.form.activityHours ?? 0} hrs/week</li>
          <li>
            Dietary: ${(this.form.dietaryPreferences ?? []).join(", ") || "None"}
          </li>
        </ul>
      </div>
    `;
  }

  static styles = css`
    main.page {
      padding: 2rem 3rem;
      max-width: 960px;
    }

    .eyebrow {
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 0.8rem;
      color: var(--color-muted, #9ea6c0);
      margin: 0 0 0.25rem 0;
    }

    .lede {
      max-width: 48rem;
      color: var(--color-muted, #9ea6c0);
    }

    .card.wizard {
      margin-top: 1.5rem;
      background: var(--color-surface-2, #050b15);
      border: 1px solid var(--color-border, #1c2230);
      border-radius: 1.25rem;
      padding: 1.5rem;
      display: grid;
      gap: 1.25rem;
    }

    .steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      font-weight: 600;
      text-align: center;
    }

    .steps span {
      padding: 0.5rem 0.75rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--color-muted, #9ea6c0);
    }

    .steps span.active {
      background: #16a34a;
      color: #020617;
      border-color: #16a34a;
    }

    .panel {
      display: grid;
      gap: 0.75rem;
    }

    .chips {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .chip {
      padding: 0.5rem 0.85rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      cursor: pointer;
      text-transform: capitalize;
      background: rgba(255, 255, 255, 0.06);
    }

    .chip input {
      display: none;
    }

    .chip.active {
      background: #16a34a;
      color: #0f172a;
      border-color: #16a34a;
    }

    .grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    label {
      display: grid;
      gap: 0.35rem;
    }

    input,
    select {
      padding: 0.65rem 0.8rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(255, 255, 255, 0.04);
      color: inherit;
    }

    select option {
      color: #0f172a;
    }

    .macros {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.9rem;
      margin: 0.5rem 0 0;
    }

    .macros dt {
      font-size: 0.85rem;
      color: var(--color-muted, #9ea6c0);
    }

    .macros dd {
      margin: 0;
      font-weight: 700;
    }

    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    button.primary,
    button.ghost {
      padding: 0.7rem 1.1rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      color: inherit;
      background: transparent;
      font-weight: 700;
    }

    button.primary {
      background: #16a34a;
      border-color: #16a34a;
      color: #020617;
    }

    button.ghost {
      background: #facc15;
      border-color: #eab308;
      color: #0f172a;
    }
  `;
}
