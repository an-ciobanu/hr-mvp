## Run the project

**Environment variables:**  
Set these in your `.env` (at repo root):

```
# Database
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
DB_PORT=

# API
DATABASE_URL=
JWT_SECRET=
NODE_ENV=
API_PORT=

# Web
WEB_PORT=

# Development URLs
API_URL=
WEB_URL=
```

- `podman-compose -f infra/docker-compose.yml up` (or use Docker if preferred. Because we use ollama for enhancing feedback, a minimum of 5.4 GB of memory is needed for the virtual machine)
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

### 14-10 – API & Infra Container Improvements

**Architecture notes**

- Added healthcheck to API service and ensured it waits for database readiness using `depends_on` with `condition: service_healthy`
- Added healthcheck endpoint (`/health`) and DB connection test endpoint (`/api/hello`) to backend for container orchestration and diagnostics
- Confirmed Adminer is available for database inspection at port 8080

### 14-10 – Login System, Modular Routing, and Injectable DB Service

**Architecture notes**

- Added `/api/auth/login` endpoint for secure authentication using JWT and HTTP-only cookies
- Created `lib/db.js` as a singleton injectable service for Postgres access
- Refactored backend to use modular routers: `routes/auth.js` for login, `routes/status.js` for health and hello endpoints
- All routes are now mounted in `server.js` for better separation and maintainability

### 14-10 – Employee Creation Endpoint & Structured Error Logging

**Architecture notes**

- Added `POST /api/employees` endpoint for managers to create new employee accounts (with hashed password, manager_id set automatically)
- Input validation with Zod, authentication and RBAC enforced via JWT
- Errors are now logged to `logs/error.log` in structured JSON format, ready for Grafana/Loki or other log aggregators

### 14-10 – Profile Creation & Editing Endpoints

**Architecture notes**

- Added `POST /api/profiles` endpoint for employees and their managers to create a profile
- Added `PUT /api/profiles/:userId` endpoint for employees and their managers to edit a profile
- RBAC logic ensures only the employee or their manager can create/edit, and only managers can set `salary_sensitive` fields
- Input validation with Zod, authentication via JWT, and error logging integrated

### 17-10 – Absence Management, RBAC, and Demo Data

**Architecture notes**

- Added `POST /api/absences` endpoint for employees to request absences (pending by default)
- Added `PATCH /api/absences/:id` endpoint for managers to approve/deny absences (only direct manager allowed)
- Added `GET /api/absences/:userId` endpoint for employees and their manager to view all absences for a user
- RBAC enforced using custom `ensureRole` middleware and `isEmployeeOrManager` utility
- All error cases now logged using Winston logger for easier debugging
- Seeded demo absences in migration: employee 3 (pending, denied), employee 1 (approved)

### 17-10 – Frontend Skeleton Application

**Architecture notes**

- Scaffolded Vite + React frontend in `web/` with modular folder/component structure
- Centralized routing with protected routes (all except `/login`, `/`, and `*` require authentication)
- Implemented `App.jsx`, `App.css` with a modern, unified theme and layout
- Created `routes.jsx` for maintainable navigation logic
- Added `Navbar` with company name and consistent styling
- Set up basic auth check in `lib/auth.js` for route protection

## If I had more time

1. **Type Safety & Contracts**

   - JavaScript may be a good language for MVPs, but in production I would probably migrate towards at least TypeScript for type safety or Go/Java

2. **Automated Testing**

   - I did not have time to add tests for this project. Now that the MVP is functional, I would add integration tests to test out flows (manager approve/reject a leave, employee giving feedback etc) to make sure we have functionality on lockdown

3. **CI/CD Pipeline**

   - Set up a piepline to build the projects (React project still works on dev server, for example. I would like to add CI/CD so that I build the project, get static files, serve them over nginx or something)

4. **API Documentation & Validation**

   - Write down documentation on majority of the code, add a Swagger file for backend api. Documentation is also helpful for AI development frther down the line

5. **Frontend Component Library**

   - Many pieces of code from the frontend can be extracted and reused. My goal fr the MVP was to make it work, so I copy pasted a lot of code instead of modularise it.

6. **RBAC & Security Hardening**

   - The RBAC logic can also be conccentrated in a module or file. Also, I neglected security while doing this MVP. For production release, I need to go through at least the highest/most popular OWASP exploits to double check my app does not have issues

7. **Observability & Monitoring**

   - I started with the idea of a Grafana dashboard in mind, this is why I also created a log class in backend service. I would like to create a dashboard to have every user action traceable. Maybe add reqeust IDs from the frontend to the backend also

8. **UI/UX**

   - I am not a good designer and most of the way the UI looks and feels was made using AI tools and how easy was for me to test the features. A better design would be needed for production release
