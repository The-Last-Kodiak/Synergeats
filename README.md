# Synergeats – Personalized Nutrition & Meal Planning SPA

Synergeats is a single‑page web app that guides users from basic nutrition onboarding to a weekly meal schedule.  
It estimates calories/macros from user inputs, lets users store their profile and plan in MongoDB, and supports creating and managing custom meals.

The project is structured as a monorepo:

- `packages/app` – Lit + @calpoly/mustang SPA (Vite + TypeScript)
- `packages/server` – Express + MongoDB backend (REST API + static hosting)
- `packages/proto` – Early static prototypes (kept for reference only)

---

## What the app does (user experience)

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

## Running locally (dev)

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

## Deploying to csse.dev (production)

These are the steps used to deploy to the course VPS. They assume your host is `<name>-host.csse.dev` and your HTTPS endpoint is `https://<name>.csse.dev/`.

1. **SSH into your VPS**
   ```bash
   ssh <name>@<name>-host.csse.dev
   # Once only:
   passwd            # set your password
   ```

2. **Install Node 20 (first time only)**
   ```bash
   sudo apt update
   curl -sL https://deb.nodesource.com/setup_20.x -o /tmp/nodesource_setup.sh
   sudo bash /tmp/nodesource_setup.sh
   sudo apt-get install -y nodejs
   node -v           # should be 20.x
   ```

3. **Clone the repo (or pull latest)**
   ```bash
   cd ~
   git clone https://github.com/The-Last-Kodiak/Synergeats.git
   cd Synergeats
   npm install
   ```

4. **Create `.env` on the VPS**  
   In `packages/server/.env` (not committed to git), add:
   ```bash
   MONGO_USER=synergeats_db_user
   MONGO_PWD=...            # your password
   MONGO_CLUSTER=cluster0...mongodb.net
   TOKEN_SECRET=some-long-random-string
   ```
   These values must match the MongoDB Atlas user and cluster you set up during the labs.

5. **Build app + server**
   ```bash
   npm run build -w app
   npm run build -w server
   ```

6. **Start the server pointing at the SPA build**
   ```bash
   cd packages/server
   npm run start:app        # internally: STATIC=../app/dist node dist/index.js
   ```
   To keep it running after logout:
   ```bash
   nohup npm run start:app > server.log 2>&1 &
   ```

7. **Verify**
   - In a browser, open:
     - `https://<name>.csse.dev/` or `https://<name>.csse.dev/app`
   - If you see **502 Bad Gateway**, the Node process is not running:
     - SSH back in and restart with `nohup npm run start:app > server.log 2>&1 &`.

8. **Updating the deployed app**
   ```bash
   cd ~/Synergeats
   git pull
   npm run build -w app
   npm run build -w server
   nohup npm run start:app > server.log 2>&1 &
   ```

No secrets (Mongo credentials, JWT secret) are committed to GitHub. Only the `.env` file on the VPS contains them.

---

## How this meets CSC 437 learning outcomes

1. **Client‑rendered web app with few dependencies**
   - All HTML is rendered on the client using Lit components and the Mustang MVU model.
   - The server provides JSON via REST endpoints; no server‑side templating.
   - Runtime dependencies are limited to Lit + @calpoly/mustang on the client and Express + Mongoose on the server.

2. **Separation of HTML, CSS, and TypeScript**
   - Views/components are built as HTML‑first templates styled with CSS custom properties, flexbox, and grid.
   - Behavior is added via TypeScript in Lit elements (e.g., form handling, message dispatch, routing).
   - Styling is encapsulated per component; layout tokens are reused across views to keep the design consistent.

3. **Understanding framework trade‑offs (MVU and SPA routing)**
   - The client uses @calpoly/mustang’s MVU pattern: a central `model`, an `update` function handling messages, and views reacting to state.
   - Routing is handled client‑side (e.g., `/app`, `/app/plan`, `/app/meals`, `/app/profile`, `/app/login`), switching views without full page reloads—classic SPA behavior.
   - The code demonstrates how a light framework (Mustang + Lit) can organize state and routing without pulling in a large ecosystem.

4. **Fluency with a framework (Lit + Mustang) and portability**
   - The app defines multiple Lit components (views and reusable cards) and wires them with Mustang’s store, auth, and history.
   - Concepts like render methods, reactive properties, message dispatch, effects, and auth stores map directly to similar features in larger frameworks (React, Vue, etc.), making it easier to ramp up on others.

5. **Client/server separation and security**
   - The backend exposes REST APIs for auth, meals, profile, plan, and history; the frontend calls them with `fetch` and JWT headers.
   - MongoDB Atlas stores user data; credentials and secrets are only present in `.env` on the VPS.
   - The app is deployed to `https://<name>.csse.dev`, behind a reverse proxy that terminates HTTPS, so users access it over an encrypted connection.
   - Unauthenticated users only see public endpoints (`/api/public/meals`); all profile/meal plan changes require a valid JWT.

---

## Notes for the grader

- **Deployed URL:** `https://<name>.csse.dev/app` (replace `<name>` with my csse.dev username).  
- **Repo:** this GitHub repository (main branch).  
- **To restart the app on the VPS:**
  ```bash
  cd ~/Synergeats
  npm run build -w app
  npm run build -w server
  cd packages/server
  nohup npm run start:app > server.log 2>&1 &
  ```

