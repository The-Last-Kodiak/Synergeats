import { html, css, LitElement } from "lit";
import { property } from "lit/decorators.js";

export class MealCardElement extends LitElement {
  // Attributes
  @property({ attribute: "img-src" }) imgSrc?: string;
  @property() href?: string;

  @property({ type: Number }) calories?: number;
  @property({ type: Number }) protein?: number;
  @property({ type: Number }) carbs?: number;
  @property({ type: Number }) fat?: number;

  override render() {
    return html`
      <article class="card">
        ${this.imgSrc
          ? html`
              <a
                class="thumb"
                href=${this.href ?? "#"}
                aria-label="Open meal"
              >
                <img src=${this.imgSrc} alt="" loading="lazy" />
              </a>
            `
          : null}

        <div class="content">
          <h3 class="title">
            <a href=${this.href ?? "#"}><slot></slot></a>
          </h3>

          <p class="tags"><slot name="tags"></slot></p>

          <dl class="macros">
            <div>
              <dt>Calories</dt>
              <dd>${this.calories ?? "—"}</dd>
            </div>
            <div>
              <dt>Protein</dt>
              <dd>${this.protein ?? "—"} g</dd>
            </div>
            <div>
              <dt>Carbs</dt>
              <dd>${this.carbs ?? "—"} g</dd>
            </div>
            <div>
              <dt>Fat</dt>
              <dd>${this.fat ?? "—"} g</dd>
            </div>
          </dl>
        </div>
      </article>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .card {
      background: var(--color-surface-1);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-2xl);
      display: grid;
      grid-template-columns: minmax(110px, 140px) 1fr;
      gap: 1rem;
      padding: 1rem;
      max-width: 100%;
      align-items: stretch;
    }

    .thumb {
      display: block;
    }

    .thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: calc(var(--radius-2xl) - 6px);
      display: block;
    }

    .content {
      display: grid;
      gap: 0.5rem;
      align-content: start;
      min-width: 0;
    }

    .title {
      font-family: var(--font-display-stack);
      line-height: var(--leading-tight);
      margin: 0;
      font-size: var(--font-size-4);
      font-weight: var(--font-weight-semibold);
    }

    .title a {
      color: var(--color-text);
      text-decoration: none;
    }

    .title a:hover {
      color: var(--color-link-hover);
      text-decoration: underline;
    }

    .tags {
      color: var(--color-text-muted);
      margin: 0;
      font-size: 0.9rem;
    }

    .macros {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
      gap: 0.5rem 1.25rem;
      margin: 0.25rem 0 0;
    }

    .macros div {
      display: grid;
      gap: 0.25rem;
      min-width: 0;
    }

    dt {
      color: var(--color-text-muted);
      font-weight: 600;
      font-size: 0.8rem;
      line-height: 1.1;
    }

    dd {
      margin: 0;
      font-size: 0.9rem;
    }

    @media (max-width: 640px) {
      .card {
        grid-template-columns: 1fr;
      }
    }
  `;
}
