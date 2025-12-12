# Synergeats – Personalized Nutrition & Meal Planning

Synergeats is a monorepo with three packages:

- `packages/app` – Lit + Mustang single-page app (SPA) for onboarding, planning macros, browsing meals, and editing your profile.
- `packages/server` – Express + MongoDB API for auth (`/auth`), meals (`/api/meals`), and profile (`/api/profile/:userid`).
- `packages/proto` – Early static prototypes kept for reference.

## What the app does

- **Onboarding wizard** (logged out or in): asks about diet, weight, goal, gender, and activity; previews recommended calories/macros; routes you into the plan.
- **Home**: logged-out hero with “Start configuration”, sign-in link, and light/dark toggle; logged-in dashboard shows your goal, weight, macros, and quick links to Plan, Profile, and Meals.
- **Plan**: edit weight/goal/gender/activity/dietary prefs, see recommended macros, and view suggested meals for the week.
- **Profile**: manually tweak calories/macros and dietary flags; saves to your account.
- **Meals**: browse meals from the API; edit an individual meal when needed.
- **Auth**: JWT-based login/register; SPA navigation handled by Mustang history.

## Running locally

1) Install deps at the repo root: `npm install` (workspaces).  
2) Server: `cd packages/server && npm run dev` (serves static from `packages/proto/dist` by default; set `STATIC=../app/dist` to serve the SPA build).  
3) App: `cd packages/app && npm run dev` (Vite dev server).  
4) Build SPA: `npm run build` in `packages/app`, then run the server with `STATIC=../app/dist`.  

Environment:

- MongoDB URL is derived from env vars `MONGO_USER`, `MONGO_PWD`, `MONGO_CLUSTER`; otherwise defaults to localhost.
- JWT secret via `TOKEN_SECRET` (falls back to a non-secret string for dev).

## Deployment notes

- For production, build the SPA (`packages/app/dist`) and set `STATIC=../app/dist` before starting `packages/server`.
- Ensure `.env` with Mongo credentials and `TOKEN_SECRET` is present on the VPS; do not commit secrets.

## Current API surface

- `POST /auth/register`, `POST /auth/login` → `{ token }`.
- `GET /api/meals` (auth), `GET/PUT/DELETE /api/meals/:id` (auth).
- `GET /api/profile/:userid` (auth) → returns profile including macros and preferences.
- `PUT /api/profile/:userid` (auth) → upserts profile with weight/goal/gender/activity/dietary prefs and macro targets.

## Status

- Core flows (onboarding, home variants, plan/profile editing, meal browsing) are wired in the SPA.
- Profile persistence now aligns with JWT `username`/`sub`, and macro fields are stored server-side.
- Prototype pages remain for design reference but the SPA is the primary entry point.
