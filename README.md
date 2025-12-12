# Synergeats – Personalized Nutrition & Meal Planning SPA

Synergeats is a single‑page web app that guides users from basic nutrition onboarding to a weekly meal schedule.  
It estimates calories/macros from user inputs, lets users store their profile and plan in MongoDB, and supports creating and managing custom meals.

The project is structured as a monorepo:

- `packages/app` – Lit + @calpoly/mustang SPA (Vite + TypeScript)
- `packages/server` – Express + MongoDB backend (REST API + static hosting)
- `packages/proto` – Early static prototypes (kept for reference only)

---

## What the app does

**Logged‑out**

- Home page explains the app, shows default meals, and provides:
  - “Create an account” → sign‑up
  - “Sign in” → login
  - Light/dark mode toggle
- You can browse default meals without signing in (no edits or saves).

**Account, onboarding, and profile**

- **Sign up / sign in**
  - Username + password with JWT‑based auth.
  - Auth state is handled on the client by @calpoly/mustang’s auth store.
- **Onboarding (first‑time setup)**
  - Collects: goal (bulk/maintain/cut), weight, gender, activity hours, and dietary preferences.
  - Uses a macro estimation utility to suggest calories, protein, carbs, and fat.
  - Caches answers briefly; once a profile is saved, onboarding no longer overwrites it.
- **Profile page**
  - Edit goal, weight, gender, activity hours, and dietary preference flags.
  - Edit macro targets (calories, protein, carbs, fat) directly.
  - “Apply recommended macros” button re‑runs the macro estimator and updates the targets.
  - Changes are saved to the user’s profile document in MongoDB.

**Plan & scheduling**

- **Plan page**
  - Shows a macro summary based on the current profile (calories + macros).
  - Lets users assign meals to each day of the week (Sun–Sat) using checkboxes.
  - “Apply this day to all” copies one day’s selection across the week.
  - “Save schedule” stores the weekly plan and a personal meal list in MongoDB.
- **Meals page**
  - Shows “My meals list”: checkboxes to add/remove meals from your personal set.
  - Main grid lists meals (default + user‑created when logged in).
  - You can view a meal’s details on its own page (image, macros, tags, ingredients).
  - When authenticated:
    - Create new meals (with macros, tags, optional ingredients, optional image URL).
    - Edit or delete meals you own (default meals are read‑only).
- **How plan and meals work together**
  - The Plan page uses the personal “My meals” list saved from the Meals page.
  - Weekly plan selections are persisted per user in the `UserPlans` collection.

---

## Architecture

**Frontend (`packages/app`)**

- Built with **Lit** for web components and **@calpoly/mustang** for:
  - Global store (model), MVU update function, and messages/effects.
  - Client‑side routing for views (Home, Plan, Meals, Profile, Auth).
  - Auth store and history navigation.
- Entire UI is client‑rendered; the server only serves JSON APIs and static assets.
- Views include:
  - `home-view` – logged‑out hero + logged‑in dashboard.
  - `onboarding-view` – guided setup for diet/goals/activity.
  - `plan-view` – macros summary + weekly schedule editor.
  - `meals-view` – personal meal list + menu.
  - `meal-detail-view` – individual meal page.
  - `profile-view` – full profile + macro editor.
  - `login-view` / `signup-view` – auth flow.

**Backend (`packages/server`)**

- Express + TypeScript (compiled with `etsc`).
- Routes:
  - `POST /auth/register`, `POST /auth/login` → JWT token.
  - `GET /api/public/meals` → default meals (no auth).
  - `GET /api/meals`, `GET/PUT/DELETE /api/meals/:id` → user + default meals (auth).
  - `GET /api/profile/:userid`, `PUT /api/profile/:userid` → profile with macros & preferences (auth).
  - `GET /api/plan`, `PUT /api/plan` → weekly plan + `myMeals` list (auth).
  - `GET /api/history`, `PUT /api/history` → per‑user weekly completion history (auth, basic backend support).
- Models (Mongoose):
  - `Meal` in `Synergeats_meals` (id, name, macros, tags, ingredients, imgSrc, owner).
  - `Profile` in `profiles` (userid, weight, goal, gender, activityHours, dietaryPreferences, macro targets, optional weeklyPlan).
  - `Plan` in `UserPlans` (userid, `weeklyPlan: Record<day, string[]>`, `myMeals: string[]`).
  - `History` in `UserHistory` (userid, weekly array of day completion stats).
  - `user_credentials` (auth user/pass; created via /auth routes).
- Data store:
  - MongoDB Atlas cluster; connection string is provided via `.env` on the VPS (not in Git).

**Static hosting**

- The server reads a `STATIC` env var to know where to serve the SPA from.
- In production we use:
  - `STATIC=../app/dist`
  - Express serves static assets from that directory and sends `index.html` for `/app` routes.

---

## Running locally

From the repo root:

1. Install dependencies (monorepo workspaces):
   ```bash
   npm install
   ```

2. Start the backend in dev mode:
   ```bash
   cd packages/server
   npm run dev
   ```
   - By default it serves static assets from `packages/proto/dist`.
   - To serve the real SPA build during dev, set:
     ```bash
     STATIC=../app/dist npm run dev
     ```

3. Start the SPA dev server (Vite):
   ```bash
   cd packages/app
   npm run dev
   ```
   - Visit `http://localhost:5173/app` (or the Vite URL it prints).

4. Build the SPA:
   ```bash
   cd packages/app
   npm run build
   ```
   - Output goes into `packages/app/dist`.

5. Environment variables for local dev:
   - `.env` (not committed) for the server:
     - `MONGO_USER`, `MONGO_PWD`, `MONGO_CLUSTER` → Atlas connection.
     - `TOKEN_SECRET` → JWT signing secret.
   - If these are not set, the server falls back to localhost Mongo and a non‑secret token key, which is fine for local testing only.

---

## Notes for the grader

- **Deployed URL:** `https://<name>.csse.dev/app` (replace `<name>` with my csse.dev username).  
- **Repo:** this GitHub repository (main branch).  
- **To restart the app on the VPS:**
  ```bash
  cd ~/Synergeats
  npm run build -w app
  npm run build -w server
  npm run start:app -w server
  ```

