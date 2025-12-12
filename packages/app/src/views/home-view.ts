// packages/app/src/views/home-view.ts
import { Auth, History, Observer, View, Message } from "@calpoly/mustang";
import { css, html } from "lit";
import { state } from "lit/decorators.js";
import type { Meal, Profile } from "server/models";

import type { Model } from "../model";
import type { Msg } from "../messages";

const BULLET = "•";

export class HomeViewElement extends View<Model, Msg> {
  @state()
  private auth?: Auth.Model;

  @state()
  private theme: "dark" | "light" = "dark";

  @state()
  private publicMeals: Meal[] = [];

  private authObserver = new Observer<Auth.Model>(this, "Synergeats:auth");

  constructor() {
    super("Synergeats:model");
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.authObserver.observe((auth) => {
      this.auth = auth;
      if (auth.user?.authenticated) {
        const reactions: Message.Reactions = {};
        this.dispatchMessage(["profile/request", {}, reactions]);
        this.dispatchMessage(["plan/request", {}, reactions]);

        // Apply cached onboarding once the user is authenticated, only if no real data exists
        const hasProfileData =
          this.model.profile &&
          (this.model.profile.weightLbs || this.model.profile.goal);

        if (!hasProfileData) {
          const cached = localStorage.getItem("synergeats:onboarding");
          if (cached) {
            try {
              const payload = JSON.parse(cached);
              this.dispatchMessage([
                "profile/save",
                payload,
                {} as Message.Reactions
              ]);
              localStorage.removeItem("synergeats:onboarding");
            } catch {
              /* ignore bad cache */
            }
          }
        }
      }
    });

    const storedTheme = localStorage.getItem("synergeats:theme");
    if (storedTheme === "light") this.setTheme("light");

    this.loadPublicMeals();
  }

  private loadPublicMeals() {
    fetch("/api/public/meals")
      .then((r) => (r.ok ? r.json() : []))
      .then((json: Meal[]) => (this.publicMeals = json ?? []))
      .catch(() => (this.publicMeals = []));
  }

  private setTheme(next: "dark" | "light") {
    this.theme = next;
    document.body.classList.toggle("light-mode", next === "light");
    localStorage.setItem("synergeats:theme", next);
  }

  private toggleTheme = () => {
    this.setTheme(this.theme === "dark" ? "light" : "dark");
  };

  private navigate(ev: Event, href: string) {
    ev.preventDefault();
    History.dispatch(this, "history/navigate", { href });
  }

  private get isLoggedIn() {
    return Boolean(this.auth?.user?.authenticated);
  }

  private get username() {
    const user = this.auth?.user as any;
    return user?.username ?? user?.userid ?? user?.sub ?? "you";
  }

  render() {
    const profile = this.model.profile;
    const needsOnboarding = !profile || !profile.weightLbs || !profile.goal;

    return html`
      <main class="page home">
        <section class="hero card">
          <div class="header-row">
            <h1>Synergeats</h1>
            <div class="toggles">
              <label class="mode">
                <input
                  type="checkbox"
                  @change=${this.toggleTheme}
                  ?checked=${this.theme === "light"}
                />
                <span>Light mode</span>
              </label>
              ${this.isLoggedIn
                ? null
                : html`
                    <a
                      class="ghost"
                      href="/app/login"
                      @click=${(e: Event) => this.navigate(e, "/app/login")}
                    >
                      Sign in
                    </a>
                  `}
            </div>
          </div>

          <p>
            Guided nutrition made simple. Answer a few questions, we calculate
            your macros, and you pick meals that fit.
          </p>

          ${!this.isLoggedIn
            ? html`
                <div class="cta-row">
                  <a
                    class="primary"
                    href="/app/signup"
                    @click=${(e: Event) => this.navigate(e, "/app/signup")}
                  >
                    Create an account
                  </a>
                  <a
                    class="ghost"
                    href="/app/login"
                    @click=${(e: Event) => this.navigate(e, "/app/login")}
                  >
                    Sign in
                  </a>
                </div>
              `
            : html`
                <div class="cta-row">
                  <a
                    class="primary"
                    href="/app/plan"
                    @click=${(e: Event) => this.navigate(e, "/app/plan")}
                  >
                    Plan & schedule
                  </a>
                  <a
                    class="ghost"
                    href="/app/meals"
                    @click=${(e: Event) => this.navigate(e, "/app/meals")}
                  >
                    Select meals
                  </a>
                </div>
              `}
        </section>

        ${!this.isLoggedIn
          ? this.renderLoggedOut()
          : needsOnboarding
          ? this.renderOnboardingPrompt()
          : this.renderDashboard(profile)}
      </main>
    `;
  }

  private renderLoggedOut() {
    return html`
      <section class="card preview">
        <h2>Why Synergeats?</h2>
        <ol>
          <li>Answer a short onboarding (diet, goals, activity).</li>
          <li>We estimate calories & macros you can tweak anytime.</li>
          <li>Pick weekly meals that match your targets.</li>
        </ol>
        <p class="hint">
          Browse our default meals below. Saving your plan requires an account.
        </p>
        <div class="cta-row">
          <a
            class="primary"
            href="/app/signup"
            @click=${(e: Event) => this.navigate(e, "/app/signup")}
          >
            Sign up free
          </a>
        </div>
        <div class="meal-preview">
          ${(this.publicMeals ?? []).map(
            (meal) => html`
              <article class="mini-card">
                <h4>${meal.name}</h4>
                <p class="tags">${(meal.tags ?? []).join(` ${BULLET} `)}</p>
                <p class="macros">${meal.calories ?? "—"} kcal</p>
              </article>
            `
          )}
        </div>
      </section>
    `;
  }

  private renderOnboardingPrompt() {
    return html`
      <section class="card preview">
        <h2>Finish onboarding</h2>
        <p class="hint">
          We need your diet, goal, and activity to build your plan.
        </p>
        <a
          class="primary"
          href="/app/onboarding"
          @click=${(e: Event) => this.navigate(e, "/app/onboarding")}
        >
          Start now
        </a>
      </section>
    `;
  }

  private renderDashboard(profile?: Profile) {
    const hasProfile = Boolean(profile);

    return html`
      <section class="card split">
        <div>
          <p class="eyebrow">Welcome back</p>
          <h2>${this.username}, here is your plan</h2>
          ${hasProfile
            ? html`
                <dl class="stats">
                  <div>
                    <dt>Goal</dt>
                    <dd>${profile?.goal ?? "maintain"}</dd>
                  </div>
                  <div>
                    <dt>Weight</dt>
                    <dd>${profile?.weightLbs ?? "—"} lb</dd>
                  </div>
                  <div>
                    <dt>Calories</dt>
                    <dd>${profile?.calories ?? "—"} kcal</dd>
                  </div>
                  <div>
                    <dt>Protein</dt>
                    <dd>${profile?.proteinTarget ?? "—"} g</dd>
                  </div>
                  <div>
                    <dt>Carbs</dt>
                    <dd>${profile?.carbsTarget ?? "—"} g</dd>
                  </div>
                  <div>
                    <dt>Fat</dt>
                    <dd>${profile?.fatTarget ?? "—"} g</dd>
                  </div>
                </dl>
              `
            : html`
                <p class="hint">
                  You have not configured a plan yet. Start with the plan page
                  to calculate your macros.
                </p>
              `}

          <div class="cta-row">
            <a
              class="primary"
              href="/app/plan"
              @click=${(e: Event) => this.navigate(e, "/app/plan")}
            >
              Adjust plan
            </a>
            <a
              class="ghost"
              href="/app/profile"
              @click=${(e: Event) => this.navigate(e, "/app/profile")}
            >
              Edit profile
            </a>
          </div>
        </div>

        <div class="card inset">
          <h3>Your week</h3>
          <p class="hint">
            Review your selected meals for the week and make swaps anytime.
          </p>
          <ul class="links">
            <li>
              <a
                href="/app/meals"
                @click=${(e: Event) => this.navigate(e, "/app/meals")}
              >
                Meal selections
              </a>
            </li>
            <li>
              <a
                href="/app/plan"
                @click=${(e: Event) => this.navigate(e, "/app/plan")}
              >
                Plan + macros
              </a>
            </li>
          </ul>
        </div>
      </section>
    `;
  }

  static styles = css`
    main.home {
      padding: 2rem 3rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .card {
      padding: 2rem 2.5rem;
      border-radius: var(--radius-2xl, 1.5rem);
      background: var(--color-surface-1, #0f172a);
      border: 1px solid var(--color-border, #1c2230);
      color: var(--color-text, #e5e7eb);
    }

    .card.inset {
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed rgba(255, 255, 255, 0.15);
    }

    .hero h1 {
      margin-bottom: 0.75rem;
      font-size: 2rem;
    }

    .hero p {
      margin-bottom: 0.75rem;
      max-width: 40rem;
    }

    .cta-row {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-top: 0.75rem;
    }

    a.primary,
    a.ghost {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.65rem 1.2rem;
      border-radius: 999px;
      font-weight: 700;
      text-decoration: none;
      border: 1px solid var(--color-border, #1c2230);
      color: inherit;
    }

    a.primary {
      background: #16a34a;
      color: #020617;
      border-color: #16a34a;
    }

    a.ghost:hover {
      border-color: var(--color-border, #1c2230);
    }

    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .toggles {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .mode {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.95rem;
    }

    .split {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: 1.3fr 1fr;
    }

    @media (max-width: 860px) {
      .split {
        grid-template-columns: 1fr;
      }
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }

    .stats dt {
      font-size: 0.85rem;
      color: var(--color-muted, #9ea6c0);
    }

    .stats dd {
      margin: 0;
      font-weight: 700;
    }

    .eyebrow {
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 0.8rem;
      color: var(--color-muted, #9ea6c0);
      margin: 0 0 0.4rem 0;
    }

    .links {
      list-style: none;
      padding: 0;
      margin: 0.5rem 0 0;
      display: grid;
      gap: 0.5rem;
    }

    .links a {
      color: var(--color-link, #1cd96a);
      text-decoration: none;
    }

    .preview ol {
      margin: 0 0 0.6rem 1.1rem;
      padding: 0;
      display: grid;
      gap: 0.35rem;
    }

    .hint {
      color: var(--color-muted, #9ea6c0);
      margin: 0.25rem 0 0;
    }

    .meal-preview {
      margin-top: 1rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.5rem;
    }

    .mini-card {
      padding: 0.75rem;
      border: 1px solid var(--color-border, #1c2230);
      border-radius: 0.75rem;
      background: var(--color-surface-2, #0f1b32);
    }

    .mini-card h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
    }

    .mini-card .tags,
    .mini-card .macros {
      margin: 0;
      font-size: 0.85rem;
      color: var(--color-muted, #9ea6c0);
    }
  `;
}
