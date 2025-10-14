## Run the project

**Environment variables:**  
Set these in your `.env` (at repo root):

```
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
DB_PORT=
DATABASE_URL=
PORT=
JWT_SECRET=
WEB_URL=
HUGGINGFACE_API_KEY=
```

- `podman-compose -f infra/docker-compose.yml up` (or use Docker if preferred)
- Access Adminer at [http://localhost:8080](http://localhost:8080) (used for development purposes)

## Change Log (human-friendly)

### 14-10 – Database Schema & Hierarchical RBAC Setup

**Architecture notes**

- Added hierarchical manager-employee relationships via `manager_id` self-referencing FK in users table
- Coworker role is now computed (same manager_id) rather than stored - cleaner RBAC logic
- Created helper views (`coworkers`, `direct_reports`) to simplify common RBAC queries
- JSONB fields for flexible emergency contacts and salary data structure
- Added admin user that will be able to add employees into the database

**If we had more time**

- Add org chart visualization using the hierarchical data
- Implement cascading permissions (managers inherit from higher-level managers)
- Add department-level RBAC rules beyond just manager hierarchy

---

### 14-10 – API & Infra Container Improvements

**Architecture notes**

- Added healthcheck to API service and ensured it waits for database readiness using `depends_on` with `condition: service_healthy`
- Added healthcheck endpoint (`/health`) and DB connection test endpoint (`/api/hello`) to backend for container orchestration and diagnostics
- Confirmed Adminer is available for database inspection at port 8080

**If we had more time**

- Add frontend container to Compose for full-stack orchestration
- Automate running migrations/seeds inside containers for easier onboarding
- Add more granular healthchecks and readiness probes for production stability

### 14-10 – Login System, Modular Routing, and Injectable DB Service

**Architecture notes**

- Added `/api/auth/login` endpoint for secure authentication using JWT and HTTP-only cookies
- Created `lib/db.js` as a singleton injectable service for Postgres access
- Refactored backend to use modular routers: `routes/auth.js` for login, `routes/status.js` for health and hello endpoints
- All routes are now mounted in `server.js` for better separation and maintainability

**If we had more time**

- Add logout and session validation endpoints
- Implement RBAC middleware for protected routes
- Add integration and unit tests for authentication and error handling

### 14-10 – Employee Creation Endpoint & Structured Error Logging

**Architecture notes**

- Added `POST /api/employees` endpoint for managers to create new employee accounts (with hashed password, manager_id set automatically)
- Input validation with Zod, authentication and RBAC enforced via JWT
- Errors are now logged to `logs/error.log` in structured JSON format, ready for Grafana/Loki or other log aggregators

**If we had more time**

- Add audit logging for all sensitive actions
- Add log rotation and retention policies
- Extend employee creation to support bulk import and email notifications
