// packages/app/src/main.ts
import {
  Auth,
  History,
  Switch,
  Store,
  define
} from "@calpoly/mustang";
import { html } from "lit";

import { Model, init } from "./model";
import update from "./update";
import { Msg } from "./messages";

import { SynergeatsHeaderElement } from "./components/synergeats-header";
import { HomeViewElement } from "./views/home-view";
import { MealsViewElement } from "./views/meals-view";
import { MealEditViewElement } from "./views/meal-edit-view";

// Routes for the SPA
const routes: Switch.Route[] = [
  {
    path: "/app/meals/:id/edit",
    view: (params: Switch.Params) => html`
      <meal-edit-view meal-id=${params.id}></meal-edit-view>
    `
  },
  {
    path: "/app/meals",
    view: () => html`<meals-view></meals-view>`
  },
  {
    path: "/app",
    view: () => html`<home-view></home-view>`
  },
  {
    path: "/",
    redirect: "/app"
  }
];

define({
  // Mustang providers
  "mu-auth": Auth.Provider,
  "mu-history": History.Provider,
  "mu-switch": class AppSwitch extends Switch.Element {
    constructor() {
      super(routes, "Synergeats:history", "Synergeats:auth");
    }
  },
  "mu-store": class AppStore extends Store.Provider<Model, Msg> {
    constructor() {
      // last arg must match provides="Synergeats:auth" in index.html
      super(update, init, "Synergeats:auth");
    }
  },

  // Your own components
  "sg-header": SynergeatsHeaderElement,
  "home-view": HomeViewElement,
  "meals-view": MealsViewElement,
  "meal-edit-view": MealEditViewElement
});
