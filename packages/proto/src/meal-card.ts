// packages/proto/src/meal-card.ts
import { html, css, LitElement } from "lit";
import { property } from "lit/decorators.js";

export class MealCardElement extends LitElement {
  // Attributes mapped to properties
  @property({ attribute: "img-src" }) imgSrc?: string;
  @property() href?: string;
  @property() calories?: string;
  @property() protein?: string;
  @property() carbs?: string;
  @property() fat?: string;

  override render() {
    return html`
      <article class="card">
        ${this.imgSrc
          ? html`<img src="${this.imgSrc}" alt="${this.textContent}" />`
          : html`<div class="placeholder"></div>`}
        <h3><a href="${this.href}"><slot></slot></a></h3>
        <p class="tags"><slot name="tags"></slot></p>
        <dl class="macros">
          <dt>Calories</dt><dd>${this.calories}</dd>
          <dt>Protein</dt><dd>${this.protein} g</dd>
          <dt>Carbs</dt><dd>${this.carbs} g</dd>
          <dt>Fat</dt><dd>${this.fat} g</dd>
        </dl>
      </article>
    `;
  }

  static styles = css`
    :host {
      display: block;
      max-width: 320px;
      margin: 1rem auto;
      font-family: var(--font-body-stack);
    }

    article.card {
      display: grid;
      gap: 0.5rem;
      background: var(--color-surface-1);
      padding: 1rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-2xl);
      text-align: center;
      color: var(--color-text);
    }

    img, .placeholder {
      width: 100%;
      height: 180px;
      object-fit: cover;
      background: rgba(255, 255, 255, 0.06);
      border-bottom: 1px solid var(--color-border);
      border-radius: 10px;
      display: block;
    }

    .placeholder {
      background: linear-gradient(135deg, #333, #111);
    }

    h3 {
      font-family: var(--font-display-stack);
      font-size: var(--font-size-4);
      margin: 0.25rem 0;
    }

    a {
      color: var(--color-link);
      text-decoration: none;
    }

    a:hover {
      color: var(--color-link-hover);
      text-decoration: underline;
    }

    .tags {
      font-size: var(--font-size-1);
      color: var(--color-text-muted);
    }

    dl.macros {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.25rem 1rem;
      font-size: var(--font-size-2);
    }

    dt {
      font-weight: 600;
      color: var(--color-text-muted);
    }

    dd {
      margin: 0;
      text-align: left;
    }
  `;
}
