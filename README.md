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

## Tech stack - Why did I choose what I chose?

### Database: Postgres

**Advantages**

- Since I envisioned a database schema that has relations between entities I automatically looked for a SQL database
- Postgres itself offers many extensions that can be used out of the box. [You can actually make a fullstack app using only Postgres](https://www.youtube.com/watch?v=3JW732GrMdg)

**Disadvantages**

- The more changes in an SQL database schema are done, the slower the project. Once you start modifying the lower levels of any fullstack app, you might need to revisit logic in an upper part of it. If the schema is not thought through in the beginning, any modification can add delays/bugs

### Backend: Bun

**Avantages**

- JavaScript is a good language for MVPs
- Simple, fast for development since is untyped
- AI friendly: many projects that were used to train LLMs where JavaScript oriented, so most of them are biased towards JavaScript
- Good support online: many knowledge pools regarding JS are online. Also, there are many modules that can be used to haste development so that we are not reinventing the wheel
- Bun has an integrated package manager compatible with npm. Runtime developed in Zig, created to be faster than NodeJS and use less resources. Out of the box support for typescript, too, in case an MVP needs to be taken a step further and be more production like.

**Disadvantages**

- Since JavaScript is untyped, in a larger application bugs can be introduced due to not handling well the objects we create
- Slow at runtime
- Uses too many resources compared to other languages (Go comes to mind)
- If a project is too dependent on external modules, maintaining it and keeping it secure is a hastle

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

### 14-10 – Profile Creation & Editing Endpoints

**Architecture notes**

- Added `POST /api/profiles` endpoint for employees and their managers to create a profile
- Added `PUT /api/profiles/:userId` endpoint for employees and their managers to edit a profile
- RBAC logic ensures only the employee or their manager can create/edit, and only managers can set `salary_sensitive` fields
- Input validation with Zod, authentication via JWT, and error logging integrated

**If we had more time**

- Add audit trail for profile changes
- Add field-level permissions for more granular control
- Add profile history/versioning for rollback and review
