// packages/app/src/components/synergeats-header.ts
import { LitElement, html } from "lit";

/**
 * Simple header for the SPA.
 * Renders into the light DOM so your existing .app-header
 * styles from page.css/layout.css still apply.
 */
export class SynergeatsHeaderElement extends LitElement {
  // Use light DOM so global CSS works
  protected createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <header class="app-header">
        <h1>Synergeats</h1>
        <p>Personalized meal planning SPA</p>

        <nav class="app-nav">
          <a href="/app">Home</a>
          <a href="/app/meals">Meals</a>
        </nav>
      </header>
    `;
  }
}
