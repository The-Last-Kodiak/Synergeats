// packages/app/src/views/signup-view.ts
import { LitElement, css, html } from "lit";
import { define, Form } from "@calpoly/mustang";
import { LoginFormElement } from "../auth/login-form";

export class SignupViewElement extends LitElement {
  static uses = define({
    "mu-form": Form.Element,
    "login-form": LoginFormElement
  });

  render() {
    return html`
      <main class="page">
        <section class="hero">
          <h1>Create your account</h1>
          <p>Sign up to save your plan and personalize meals.</p>
        </section>

        <section class="card">
          <login-form api="/auth/register" redirect="/app">
            <label>
              <span>Username</span>
              <input name="username" autocomplete="off" />
            </label>
            <label>
              <span>Password</span>
              <input type="password" name="password" />
            </label>
            <label>
              <span>Confirm Password</span>
              <input type="password" name="passwordConfirm" />
            </label>
            <p class="alt">
              Already have an account? <a href="/app/login">Sign in</a>
            </p>
          </login-form>
        </section>
      </main>
    `;
  }

  static styles = css`
    main.page {
      padding: 2rem 3rem;
      max-width: 640px;
      margin: 0 auto;
    }

    .hero {
      margin-bottom: 2rem;
    }

    .hero h1 {
      margin: 0 0 0.5rem 0;
    }

    .card {
      padding: 2rem;
      border-radius: 1.25rem;
      background: var(--color-surface-2, #050b15);
      border: 1px solid var(--color-border, #1c2230);
    }

    login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    input {
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.25);
      color: inherit;
    }
  `;
}
