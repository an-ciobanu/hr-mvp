# Copilot Repository Instructions

## Project context (read first)

This repo is a 5-day MVP for an HR Employee Profile SPA:

- Roles:
  - **Manager/Owner**: view & edit all profile fields.
  - **Coworker**: view non-sensitive fields; leave feedback (optional AI “polish” via Hugging Face).
  - **Employee**: request absences.
- Keep solutions minimal, explicit, and shippable. Prioritize clarity over clever abstractions.

## Tech & conventions

- **Runtime:** Bun
- **Backend:** Hono (JS), Zod for request/response validation, JWT in HTTP-only cookie
- **DB:** Postgres via `postgres` (porsager/postgres), raw SQL migrations
- **Frontend:** React + Vite (JS), react-router-dom, TanStack Query, Tailwind
- **AI:** Optional Hugging Face Inference API; 2s timeout; on error/timeout return raw text

## Folder layout

- `infra/` — docker-compose for Postgres (+ Adminer)
- `db/` — `migrations/*.sql`, `seed/seed.js`, `migrate.js` runner
- `api/` — `src/server.js`, `routes/*`, `schemas/*` (Zod), `rbac/*`, `services/*`, `clients/hf.js`, `lib/db.js`
- `web/` — Vite React app: `src/pages/*`, `src/components/*`, `src/lib/api.js`

## Coding guidelines (Copilot, follow these)

- Use **plain JavaScript** (no TypeScript).
- Validate all API inputs with **Zod**. Return `{ error, details }` on 4xx.
- Put RBAC checks in **dedicated middleware** (e.g., `rbac/ensureRole.js`) and per-field filtering in services.
- Keep route handlers thin: parse/validate -> call service -> map to response DTO.
- Use the `postgres` client’s tagged template SQL (avoid ORMs).
- For queries that return profiles to coworkers, **omit sensitive fields** (`salary_sensitive`, etc.) on the server.
- Add short JSDoc on public functions and schema comments for clarity.
- Respect 2s timeout for Hugging Face calls; on fail, return the **unpolished** feedback.
- Prefer small, focused modules over large files.

## API surface (MVP)

- `GET /api/profile/:userId` — returns full profile if manager/owner; filtered if coworker.
- `PUT /api/profile/:userId` — manager/owner only; validate partial updates with Zod.
- `POST /api/feedback?polish=true|false` — coworker/manager/owner may create; polish optional.
- `GET /api/feedback/:userId` — list feedback for a user (visible to manager/owner and the user).
- `POST /api/absences` — employee creates request (self).
- `GET /api/absences/me` — list own requests.
- `POST /api/auth/login` — seed users; sets HTTP-only cookie.
- `POST /api/auth/logout`

## Data model (initial)

- `users(id, name, email, role TEXT CHECK IN ('manager','employee','coworker'), dept)`
- `profiles(user_id PK/FK -> users.id, phone, address, emergency_contact, salary_sensitive JSONB)`
- `feedback(id, target_user_id, author_user_id, body_raw, body_polished, created_at)`
- `absences(id, user_id, start_date, end_date, reason, status TEXT CHECK IN ('requested','approved','rejected'))`

## Error handling

- Use consistent JSON: `{ error: "Message", details?: any }`
- Map validation errors to **400**, auth to **401**, RBAC to **403**, missing to **404**, server issues to **500**.
- Log server errors with minimal context; no PII in logs.

## Frontend guidance

- Use TanStack Query for all API calls (`useQuery`, `useMutation`).
- Keep forms simple; optimistic UI only for obviously safe updates (e.g., feedback create).
- Centralize fetch in `web/src/lib/api.js` (handles cookie credentials & JSON).
- Create simple pages: ProfileView, ProfileEdit, FeedbackList/New, AbsenceRequest/List, Login.

## AI polish behavior

- If `HUGGINGFACE_API_KEY` is set, call a lightweight text-generation or text-classification endpoint to rewrite/clean the feedback. Set a 2000ms timeout.
- If the call times out or errors, save `body_raw` and **leave `body_polished` null**.

## Runbook (dev)

- `bun install` at repo root (workspaces)
- `bun run -w db migrate` to apply SQL migrations
- `bun run -w db seed` to insert demo users/roles/profiles
- `bun run -w api dev` to start backend (reads `.env`)
- `bun run -w web dev` to start SPA
- Docker: `docker compose -f infra/docker-compose.yml up -d`

## Testing priorities (lean)

1. RBAC unit tests (with Bun’s test runner) around route guards.
2. Integration: feedback creation with/without AI polish (mock HF client).
3. Smoke: manager edits a profile; employee requests an absence; coworker reads filtered profile.

## README notes on each change

When generating PRs or commits, include a short README section that covers:

- **Run instructions** (env vars, commands, ports)
- **Architecture decision(s)** taken in this change
- **What to improve with more time** (1–3 bullets)
