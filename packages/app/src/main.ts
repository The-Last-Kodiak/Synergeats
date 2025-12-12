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
import { PlanViewElement } from "./views/plan-view";
import { LoginViewElement } from "./views/login-view";
import { OnboardingViewElement } from "./views/onboarding-view";
import { ProfileViewElement } from "./views/profile-view";
import { NewMealViewElement } from "./views/new-meal-view";
import { SignupViewElement } from "./views/signup-view";
import { MealDetailViewElement } from "./views/meal-detail-view";

const routes: Switch.Route[] = [
  {
    path: "/app/onboarding",
    view: () => html`<onboarding-view></onboarding-view>`
  },
  {
    path: "/app/plan",
    view: () => html`<plan-view></plan-view>`
  },
  {
    path: "/app/meals/:id/edit",
    view: (params: Switch.Params) =>
      html`<meal-edit-view meal-id=${params.id}></meal-edit-view>`
  },
  {
    path: "/app/meals/new",
    view: () => html`<new-meal-view></new-meal-view>`
  },
  {
    path: "/app/meals/:id",
    view: (params: Switch.Params) =>
      html`<meal-detail-view meal-id=${params.id}></meal-detail-view>`
  },
  {
    path: "/app/meals",
    view: () => html`<meals-view></meals-view>`
  },
  {
    path: "/app/login",
    view: () => html`<login-view></login-view>`
  },
  {
    path: "/app/signup",
    view: () => html`<signup-view></signup-view>`
  },
  {
    path: "/app/profile",
    view: () => html`<profile-view></profile-view>`
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
  "mu-auth": Auth.Provider,
  "mu-history": History.Provider,
  "mu-store": class AppStore extends Store.Provider<Model, Msg> {
    constructor() {
      super(update, init, "Synergeats:auth");
    }
  },
  "mu-switch": class AppSwitch extends Switch.Element {
    constructor() {
      super(routes, "Synergeats:history", "Synergeats:auth");
    }
  },
  "sg-header": SynergeatsHeaderElement,
  "home-view": HomeViewElement,
  "meals-view": MealsViewElement,
  "meal-edit-view": MealEditViewElement,
  "plan-view": PlanViewElement,
  "login-view": LoginViewElement,
  "onboarding-view": OnboardingViewElement,
  "profile-view": ProfileViewElement,
  "new-meal-view": NewMealViewElement,
  "signup-view": SignupViewElement,
  "meal-detail-view": MealDetailViewElement
});
