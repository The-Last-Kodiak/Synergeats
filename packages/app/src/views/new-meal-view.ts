// packages/app/src/views/new-meal-view.ts
import { History, View, Message } from "@calpoly/mustang";
import { css, html } from "lit";
import { state } from "lit/decorators.js";
import type { Meal } from "server/models";
import type { Model } from "../model";
import type { Msg } from "../messages";

export class NewMealViewElement extends View<Model, Msg> {
  @state()
  private busy = false;

  constructor() {
    super("Synergeats:model");
  }

  render() {
    // New route should not show loading; always render form
    return html`
      <main class="page">
        <h2>Add a new meal</h2>
        <p class="hint">
          Enter macros and tags for this meal. An ID slug is required. Image URL is optional (absolute or /images/ path).
        </p>

        <form class="card" @submit=${this.handleSubmit}>
          <label>
            <span>Meal ID (slug)</span>
            <input name="id" required placeholder="chicken-bowl" />
          </label>
          <label>
            <span>Name</span>
            <input name="name" required />
          </label>

          <div class="grid">
            <label>
              <span>Calories</span>
              <input type="number" name="calories" required />
            </label>
            <label>
              <span>Protein (g)</span>
              <input type="number" name="protein" required />
            </label>
            <label>
              <span>Carbs (g)</span>
              <input type="number" name="carbs" required />
            </label>
            <label>
              <span>Fat (g)</span>
              <input type="number" name="fat" required />
            </label>
          </div>

          <label>
            <span>Ingredients (optional)</span>
            <textarea name="ingredients" rows="2" placeholder="Chicken, rice, broccoli"></textarea>
          </label>

          <label>
            <span>Tags (comma-separated)</span>
            <input name="tags" placeholder="High-Protein, Gluten-Free" />
          </label>

          <label>
            <span>Image URL (optional)</span>
            <input name="imgSrc" placeholder="/images/meals/chicken.jpg or https://…" />
          </label>

          <div class="actions">
            <button type="submit" class="primary" ?disabled=${this.busy}>
              ${this.busy ? "Creating..." : "Create meal"}
            </button>
            <button
              type="button"
              class="ghost"
              @click=${(e: Event) => this.navigate(e, "/app/meals")}
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    `;
  }

  private navigate(ev: Event, href: string) {
    ev.preventDefault();
    History.dispatch(this, "history/navigate", { href });
  }

  private handleSubmit = (event: Event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    this.busy = true;

    const rawTags = (data.get("tags") as string) ?? "";
    const meal: Meal = {
      id: String(data.get("id") ?? "").trim(),
      name: String(data.get("name") ?? "").trim(),
      calories: Number(data.get("calories") ?? 0),
      protein: Number(data.get("protein") ?? 0),
      carbs: Number(data.get("carbs") ?? 0),
      fat: Number(data.get("fat") ?? 0),
      tags: rawTags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      imgSrc: String(data.get("imgSrc") ?? "").trim() || undefined,
      ingredients: String(data.get("ingredients") ?? "").trim() || undefined
    };

    const reactions: Message.Reactions = {
      onSuccess: () => {
        this.busy = false;
        History.dispatch(this, "history/navigate", { href: "/app/meals" });
      },
      onFailure: (err: Error) => {
        console.error("Failed to create meal", err);
        this.busy = false;
      }
    };

    this.dispatchMessage(["meal/create", { meal }, reactions]);
  };

  static styles = css`
    main.page {
      padding: 2rem 3rem;
      max-width: 840px;
    }

    .hint {
      color: var(--color-muted, #9ea6c0);
      margin-bottom: 1rem;
    }

    form.card {
      display: grid;
      gap: 1rem;
      background: var(--color-surface-2, #0f1b32);
      border: 1px solid var(--color-border, #1c2230);
      border-radius: 1rem;
      padding: 1.25rem;
    }

    label {
      display: grid;
      gap: 0.35rem;
    }

    input,
    textarea {
      padding: 0.55rem 0.75rem;
      border-radius: 0.6rem;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.04);
      color: inherit;
      font-family: inherit;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 0.75rem;
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
