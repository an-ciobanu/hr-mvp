# hrmvp-api

## Run instructions

To install dependencies (from repo root):

```bash
bun install
```

To start the backend server (from this folder):

```bash
bun run dev
```

The server will run on [http://localhost:3001](http://localhost:3001).

**Environment variables:**  
Set these in your `.env` (at repo root or in `api/`):

```
PORT=3001
DATABASE_URL=postgres://hrmvp:hrmvp@localhost:5432/hrmvp
JWT_SECRET=your-jwt-secret
WEB_URL=http://localhost:5173
HUGGINGFACE_API_KEY=your-hf-key-if-using-ai
```

## API endpoints

- `GET /health` — health check
- `GET /api/hello` — database connection test

## Architecture decisions

- Uses Bun runtime and Hono for minimal, fast API.
- Connects to Postgres using `postgres` client.
- CORS enabled for local frontend development.
- Healthcheck and DB test endpoints for container orchestration.

## What to improve with more time

- Add full route handlers for profiles, feedback, absences, and auth.
- Implement RBAC middleware and Zod validation.
- Add integration and RBAC unit tests.
