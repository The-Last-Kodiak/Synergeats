import { css, html, LitElement } from "lit";

export class HomeViewElement extends LitElement {
  override render() {
    return html`
      <section class="card">
        <h2>Welcome to Synergeats SPA</h2>
        <p>
          This is the single-page app version of Synergeats. Use the links
          in the header to navigate between views without reloading the page.
        </p>

        <ul class="links">
          <li><a href="/app/meals">View your meals</a></li>
        </ul>
      </section>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .card {
      background: var(--color-surface-1);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-2xl, 16px);
      padding: 1.25rem 1.5rem;
      max-width: 48rem;
      margin: 0 auto;
      display: grid;
      gap: 0.75rem;
    }

    h2 {
      font-family: var(--font-display-stack, system-ui);
      margin: 0;
    }

    .links {
      list-style: none;
      padding: 0;
      margin: 0.5rem 0 0;
      display: flex;
      gap: 1rem;
    }

    .links a {
      color: var(--color-accent);
      text-decoration: none;
      font-weight: 600;
    }

    .links a:hover {
      text-decoration: underline;
    }
  `;
}
