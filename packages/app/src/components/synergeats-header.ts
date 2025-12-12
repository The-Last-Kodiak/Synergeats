// packages/app/src/components/synergeats-header.ts
import { Auth, History, Observer } from "@calpoly/mustang";
import { LitElement, css, html } from "lit";
import { state } from "lit/decorators.js";

export class SynergeatsHeaderElement extends LitElement {
  @state()
  private user: Auth.User | null = null;

  private authObserver = new Observer<Auth.Model>(this, "Synergeats:auth");

  connectedCallback(): void {
    super.connectedCallback();
    this.authObserver.observe((auth) => {
      this.user = auth.user ?? null;
    });
  }

  private navigate(ev: Event, href: string) {
    ev.preventDefault();
    History.dispatch(this, "history/navigate", { href });
  }

  private handleSignOut(ev: Event) {
    ev.preventDefault();

    // Ask Mustang auth provider to clear the token
    this.dispatchEvent(
      new CustomEvent("auth:message", {
        bubbles: true,
        composed: true,
        detail: ["auth/signout", {}]
      })
    );

    this.user = null;
    History.dispatch(this, "history/navigate", { href: "/app" });
  }

  render() {
    const username =
      (this.user as any)?.username ??
      (this.user as any)?.userid ??
      (this.user as any)?.sub ??
      "";

    return html`
      <header class="header">
        <a class="brand" href="/app" @click=${(e: Event) => this.navigate(e, "/app")}>
          <span class="logo">Synergeats</span>
          <span class="tagline">Personalized meal planning SPA</span>
        </a>

        <nav class="nav">
          <a href="/app" @click=${(e: Event) => this.navigate(e, "/app")}>
            Home
          </a>
          <a
            href="/app/plan"
            @click=${(e: Event) => this.navigate(e, "/app/plan")}
          >
            Plan
          </a>
          <a
            href="/app/meals"
            @click=${(e: Event) => this.navigate(e, "/app/meals")}
          >
            Meals
          </a>
          <a
            href="/app/profile"
            @click=${(e: Event) => this.navigate(e, "/app/profile")}
          >
            Profile
          </a>
        </nav>

        <div class="auth">
          ${this.user && this.user.authenticated
            ? html`
                <span class="user-label">
                  Signed in as ${username}
                </span>
                <button @click=${this.handleSignOut}>Sign out</button>
              `
            : html`
                <button
                  class="ghost"
                  @click=${(e: Event) => this.navigate(e, "/app/login")}
                >
                  Sign in
                </button>
                <button
                  class="ghost"
                  @click=${(e: Event) => this.navigate(e, "/app/signup")}
                >
                  Sign up
                </button>
              `}
        </div>
      </header>
    `;
  }

  static styles = css`
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 1rem 2rem;
    }

    .brand {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      text-decoration: none;
      color: inherit;
    }

    .logo {
      font-family: var(--font-display-stack);
      font-size: 1.6rem;
    }

    .tagline {
      font-size: 0.9rem;
      color: var(--color-muted, #9ea6c0);
    }

    .nav {
      display: flex;
      gap: 1.5rem;
      font-size: 1rem;
    }

    .nav a {
      color: var(--color-link, #1cd96a);
      text-decoration: none;
    }

    .nav a:hover {
      text-decoration: underline;
    }

    .auth {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.9rem;
    }

    .auth button {
      padding: 0.4rem 0.9rem;
      border-radius: 999px;
      border: 1px solid var(--color-border, #283047);
      background: var(--color-surface-1, transparent);
      color: inherit;
      cursor: pointer;
    }

    .auth button.ghost {
      background: transparent;
    }

    .auth button:hover {
      border-color: var(--color-link, #22d3ee);
    }
  `;
}
