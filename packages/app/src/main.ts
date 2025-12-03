// packages/app/src/main.ts
import {
  Auth,
  History,
  Switch,
  Store,
  define
} from "@calpoly/mustang";
import { html } from "lit";

import type { Msg } from "./messages";
import type { Model } from "./model";
import { init } from "./model";
import update from "./update";

import { SynergeatsHeaderElement } from "./components/synergeats-header";
import { HomeViewElement } from "./views/home-view";
import { MealsViewElement } from "./views/meals-view";
import { MealCardElement } from "./components/meal-card.ts";

// Routes for <mu-switch>
const routes = [
  {
    path: "/app/meals",
    view: () => html`<sg-meals-view></sg-meals-view>`
  },
  {
    path: "/app",
    view: () => html`<sg-home-view></sg-home-view>`
  },
  {
    path: "/",
    redirect: "/app"
  }
];

define({
  // Framework providers
  "mu-auth": Auth.Provider,
  "mu-history": History.Provider,
  "mu-switch": class AppSwitch extends Switch.Element {
    constructor() {
      super(routes, "Synergeats:history", "Synergeats:auth");
    }
  },
  "mu-store": class AppStore extends Store.Provider<Model, Msg> {
    constructor() {
      // third argument is the auth provider name
      super(update, init, "Synergeats:auth");
    }
  },

  // Your components
  "sg-header": SynergeatsHeaderElement,
  "sg-home-view": HomeViewElement,
  "sg-meals-view": MealsViewElement,
  "sg-meal-card": MealCardElement
});
