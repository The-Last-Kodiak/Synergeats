// packages/app/src/views/profile-view.ts
import { define, View, Message } from "@calpoly/mustang";
import { css, html } from "lit";
import { state } from "lit/decorators.js";
import type { Gender, Goal, Profile } from "server/models";
import type { Model } from "../model";
import type { Msg } from "../messages";
import { estimateMacros } from "../utils/macros";

export class ProfileViewElement extends View<Model, Msg> {
  static uses = define({});

  @state()
  get profile(): Profile | undefined {
    return this.model.profile;
  }

  private applyRecommended = () => {
    const profile = this.profile;
    if (!profile?.weightLbs || !profile.goal) return;
    const rec = estimateMacros({
      weightLbs: profile.weightLbs,
      goal: profile.goal,
      gender: profile.gender,
      activityHours: profile.activityHours
    });

    const reactions: Message.Reactions = {};
    this.dispatchMessage([
      "profile/save",
      { ...profile, ...rec },
      reactions
    ]);
  };

  constructor() {
    super("Synergeats:model");
  }

  connectedCallback(): void {
    super.connectedCallback();
    const reactions: Message.Reactions = {};
    this.dispatchMessage(["profile/request", {}, reactions]);
  }

  render() {
    const profile = this.profile;

    return html`
      <main class="page">
        <h1>Your profile</h1>
        <p class="hint">
          Adjust your stats and macro targets. Changes are saved to your
          account.
        </p>

        <form class="card" @submit=${this.handleSubmit}>
          <div class="grid">
            <label>
              <span>Goal</span>
              <select name="goal" .value=${profile?.goal ?? "maintain"}>
                <option value="bulk">Bulk (gain)</option>
                <option value="maintain">Maintain</option>
                <option value="cut">Cut (lose fat)</option>
              </select>
            </label>

            <label>
              <span>Weight (lb)</span>
              <input
                name="weightLbs"
                type="number"
                min="80"
                max="400"
                .value=${String(profile?.weightLbs ?? "")}
                required
              />
            </label>

            <label>
              <span>Gender</span>
              <select name="gender" .value=${profile?.gender ?? "unspecified"}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="unspecified">Prefer not to say</option>
              </select>
            </label>

            <label>
              <span>Activity (hours/week)</span>
              <input
                name="activityHours"
                type="number"
                min="0"
                max="30"
                step="0.5"
                .value=${String(profile?.activityHours ?? "")}
              />
            </label>
          </div>

          <fieldset class="preferences">
            <legend>Dietary preferences</legend>
            ${["vegetarian", "vegan", "gluten-free", "dairy-free", "high-protein"]
              .map((tag) => {
                const checked =
                  profile?.dietaryPreferences?.includes(tag) ?? false;
                return html`
                  <label>
                    <input
                      type="checkbox"
                      name="dietaryPreferences"
                      value=${tag}
                      ?checked=${checked}
                    />
                    ${tag}
                  </label>
                `;
              })}
          </fieldset>

          <section class="macros">
            <h3>Macro targets</h3>
            <div class="grid">
              <label>
                <span>Calories</span>
                <input
                  name="calories"
                  type="number"
                  min="1000"
                  max="4500"
                  .value=${String(profile?.calories ?? "")}
                />
              </label>
              <label>
                <span>Protein (g)</span>
                <input
                  name="proteinTarget"
                  type="number"
                  min="40"
                  max="400"
                  .value=${String(profile?.proteinTarget ?? "")}
                />
              </label>
              <label>
                <span>Carbs (g)</span>
                <input
                  name="carbsTarget"
                  type="number"
                  min="40"
                  max="600"
                  .value=${String(profile?.carbsTarget ?? "")}
                />
              </label>
              <label>
                <span>Fat (g)</span>
                <input
                  name="fatTarget"
                  type="number"
                  min="20"
                  max="200"
                  .value=${String(profile?.fatTarget ?? "")}
                />
              </label>
            </div>
            <button type="button" class="ghost" @click=${this.applyRecommended}>
              Apply recommended macros
            </button>
          </section>

          <div class="actions">
            <button type="submit" class="primary">Save profile</button>
          </div>
        </form>
      </main>
    `;
  }

  private handleSubmit = (event: Event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const payload = {
      goal: (data.get("goal") ?? "maintain") as Goal,
      weightLbs: Number(data.get("weightLbs") ?? 0),
      gender: (data.get("gender") ?? "unspecified") as Gender,
      activityLevel: undefined,
      activityHours: data.get("activityHours")
        ? Number(data.get("activityHours"))
        : undefined,
      dietaryPreferences: Array.from(
        data.getAll("dietaryPreferences")
      ).map(String),
      calories: data.get("calories")
        ? Number(data.get("calories"))
        : undefined,
      proteinTarget: data.get("proteinTarget")
        ? Number(data.get("proteinTarget"))
        : undefined,
      carbsTarget: data.get("carbsTarget")
        ? Number(data.get("carbsTarget"))
        : undefined,
      fatTarget: data.get("fatTarget")
        ? Number(data.get("fatTarget"))
        : undefined
    };

    console.info("Profile save payload", payload);

    const reactions: Message.Reactions = {
      onSuccess: () => {
        console.info("Profile saved");
        // clear onboarding cache so stale data can't overwrite
        localStorage.removeItem("synergeats:onboarding");
      },
      onFailure: (err) => {
        console.error("Profile save failed", err);
      }
    };
    this.dispatchMessage(["profile/save", payload, reactions]);
  };

  static styles = css`
    main.page {
      padding: 2rem 3rem;
      max-width: 900px;
    }

    .hint {
      color: var(--color-muted, #9ea6c0);
      margin-bottom: 1rem;
    }

    form.card {
      padding: 1.5rem;
      border-radius: 1.25rem;
      background: var(--color-surface-2, #050b15);
      border: 1px solid var(--color-border, #1c2230);
      display: grid;
      gap: 1.25rem;
    }

    .grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    label {
      display: grid;
      gap: 0.3rem;
    }

    input,
    select {
      padding: 0.6rem 0.75rem;
      border-radius: 0.7rem;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.04);
      color: inherit;
    }

    select option {
      color: #0f172a;
    }

    fieldset.preferences {
      border: 1px dashed rgba(255, 255, 255, 0.15);
      border-radius: 0.9rem;
      padding: 0.9rem;
      display: grid;
      gap: 0.4rem;
    }

    fieldset.preferences legend {
      padding: 0 0.25rem;
      color: var(--color-muted, #9ea6c0);
    }

    fieldset.preferences label {
      display: flex;
      gap: 0.4rem;
      align-items: center;
      text-transform: capitalize;
    }

    .macros {
      display: grid;
      gap: 0.6rem;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
    }

    button.primary {
      padding: 0.65rem 1.2rem;
      border-radius: 999px;
      border: none;
      background: #16a34a;
      color: #020617;
      font-weight: 700;
      cursor: pointer;
    }
  `;
}
