// packages/app/src/components/meal-card.ts
import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";

export class MealCardElement extends LitElement {
  @property({ attribute: "img-src" })
  imgSrc = "";

  @property()
  href = "#";

  @property({ type: Number })
  calories?: number;

  @property({ type: Number })
  protein?: number;

  @property({ type: Number })
  carbs?: number;

  @property({ type: Number })
  fat?: number;

  static styles = css`
    :host {
      display: block;
    }

    article.meal-card {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: var(--radius-2xl);
      background: var(--color-surface-2, #050b15);
      border: 1px solid var(--color-border, #1c2230);
    }

    .image img {
      border-radius: var(--radius-xl, 1rem);
      width: 100%;
      height: auto;
      object-fit: cover;
    }

    h3 {
      margin: 0 0 0.25rem 0;
      font-family: var(--font-display-stack);
      font-size: 1.1rem;
    }

    h3 a {
      color: var(--color-text, #f9fbff);
      text-decoration: none;
    }

    h3 a:hover {
      text-decoration: underline;
    }

    .tags {
      margin: 0 0 0.75rem 0;
      font-size: 0.9rem;
      color: var(--color-muted, #9ea6c0);
    }

    dl.macros {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, auto));
      gap: 0.75rem;
      font-size: 0.85rem;
    }

    dl.macros div {
      display: grid;
      gap: 0.15rem;
    }

    dt {
      font-weight: 600;
      color: var(--color-muted, #9ea6c0);
    }

    dd {
      margin: 0;
      color: var(--color-text, #f9fbff);
    }

    @media (max-width: 700px) {
      article.meal-card {
        grid-template-columns: 1fr;
      }
    }
  `;

  render() {
    return html`
      <article class="meal-card">
        ${this.imgSrc
          ? html`<a class="image" href=${this.href}>
              <img src=${this.imgSrc} alt="" loading="lazy" />
            </a>`
          : null}

        <div class="body">
          <h3>
            <a href=${this.href}>
              <slot></slot>
            </a>
          </h3>

          <p class="tags">
            <slot name="tags"></slot>
          </p>

          <dl class="macros">
            ${this.calories != null
              ? html`<div>
                  <dt>Calories</dt>
                  <dd>${this.calories}</dd>
                </div>`
              : null}
            ${this.protein != null
              ? html`<div>
                  <dt>Protein</dt>
                  <dd>${this.protein} g</dd>
                </div>`
              : null}
            ${this.carbs != null
              ? html`<div>
                  <dt>Carbs</dt>
                  <dd>${this.carbs} g</dd>
                </div>`
              : null}
            ${this.fat != null
              ? html`<div>
                  <dt>Fat</dt>
                  <dd>${this.fat} g</dd>
                </div>`
              : null}
          </dl>
        </div>
      </article>
    `;
  }
}
