import { html, css, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import reset from "../styles/reset.css.js";
import headings from "../styles/headings.css.js";

interface LoginFormData {
  username?: string;
  password?: string;
  passwordConfirm?: string;
}

export class LoginFormElement extends LitElement {
  @state()
  formData: LoginFormData = {};

  @property()
  api?: string;

  @property()
  redirect: string = "/";

  @state()
  error?: string;

  get canSubmit(): boolean {
    return Boolean(
      this.api &&
      this.formData.username &&
      this.formData.password &&
      (this.isRegister
        ? this.formData.password === this.formData.passwordConfirm
        : true)
    );
  }

  private get isRegister(): boolean {
    return (this.api ?? "").includes("/register");
  }

  override render() {
    return html`
      <form
        @change=${(e: InputEvent) => this.handleChange(e)}
        @submit=${(e: SubmitEvent) => this.handleSubmit(e)}
      >
        <slot></slot>

        <slot name="button">
          <button ?disabled=${!this.canSubmit} type="submit">
            Login
          </button>
        </slot>

        <p class="error">${this.error}</p>
      </form>
    `;
  }

  static styles = [
    reset.styles,
    headings.styles,
    css`
      form {
        display: grid;
        gap: 0.75rem;
      }

      label {
        display: grid;
        gap: 0.25rem;
      }

      span {
        font-weight: 600;
      }

      input {
        padding: 0.4rem 0.6rem;
        border-radius: 4px;
        border: 1px solid var(--color-border);
        background: var(--color-surface-1);
        color: var(--color-text);
      }

      button[type="submit"] {
        padding: 0.4rem 0.8rem;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        background: var(--color-accent);
        color: var(--color-on-accent);
        font-weight: 600;
      }

      button[disabled] {
        opacity: 0.6;
        cursor: default;
      }

      .error:not(:empty) {
        color: var(--color-error);
        border: 1px solid var(--color-error);
        padding: 0.5rem;
        border-radius: 4px;
      }
    `
  ];

  handleChange(event: InputEvent) {
    const target = event.target as HTMLInputElement;
    const name = target?.name;
    const value = target?.value;
    const prevData = this.formData;

    switch (name) {
      case "username":
        this.formData = { ...prevData, username: value };
        break;
      case "password":
        this.formData = { ...prevData, password: value };
        break;
      case "passwordConfirm":
        this.formData = { ...prevData, passwordConfirm: value };
        break;
    }
  }

  handleSubmit(submitEvent: SubmitEvent) {
    submitEvent.preventDefault();

    if (this.canSubmit) {
      fetch(this.api || "", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: this.formData.username,
          password: this.formData.password
        })
      })
        .then((res) => {
          if (res.status === 201 || res.status === 200) return res.json();
          return res
            .json()
            .catch(() => ({}))
            .then((body) => {
              const msg =
                (body as any)?.error ??
                `Request failed (${res.status})`;
              throw msg;
            });
        })
        .then((json: object) => {
          const { token } = json as { token: string };

          const customEvent = new CustomEvent("auth:message", {
            bubbles: true,
            composed: true,
            detail: [
              "auth/signin",
              { token, redirect: this.redirect }
            ]
          });

          console.log("dispatching message", customEvent);
          this.dispatchEvent(customEvent);
        })
        .catch((error: unknown) => {
          console.log(error);
          this.error = String(error);
        });
    }
  }
}
