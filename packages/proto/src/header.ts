// proto/src/header.ts
import { html, css, LitElement } from "lit";
import { state } from "lit/decorators.js";
import { Auth, Observer, Events } from "@calpoly/mustang";

export class HeaderElement extends LitElement {
  static styles = css`
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background: var(--color-surface-1);
      border-bottom: 1px solid var(--color-border);
    }

    .user {
      font-weight: bold;
      font-family: var(--font-display-stack);
    }

    button, a {
      font-size: 0.9rem;
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
      cursor: pointer;
      border: none;
      background: var(--color-accent);
      color: var(--color-on-accent);
      text-decoration: none;
    }
  `;

  _authObserver = new Observer<Auth.Model>(this, "Synergeats:auth");

  @state()
  loggedIn = false;

  @state()
  username?: string;

  connectedCallback() {
    super.connectedCallback();
    this._authObserver.observe((auth) => {
      const user = auth.user;

      if (user && user.authenticated) {
        this.loggedIn = true;
        this.username = user.username;
      } else {
        this.loggedIn = false;
        this.username = undefined;
      }
    });
  }

  render() {
    return html`
      <header>
        <div class="logo">
          <h2>Synergeats</h2>
        </div>

        <div class="user">
          ${this.loggedIn ? html`
            Hello, ${this.username}
            <button @click=${this.signOut}>Sign out</button>
          ` : html`
            <a href="/login.html">Sign in</a>
          `}
        </div>
      </header>
    `;
  }

  signOut(e: Event) {
    Events.relay(e, "auth:message", ["auth/signout"]);
  }

  static initializeOnce() {}
}
