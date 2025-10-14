## Run the project

- `podman-compose -f infra/docker-compose.yml up` (or use Docker if preferred)
- Access Adminer at [http://localhost:8080](http://localhost:8080) (used for development purposes)

## Change Log (human-friendly)

### 14-10 – Database Schema & Hierarchical RBAC Setup

**Architecture notes**

- Added hierarchical manager-employee relationships via `manager_id` self-referencing FK in users table
- Coworker role is now computed (same manager_id) rather than stored - cleaner RBAC logic
- Created helper views (`coworkers`, `direct_reports`) to simplify common RBAC queries
- JSONB fields for flexible emergency contacts and salary data structure

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
