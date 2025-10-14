## Run the project

- `docker compose -f infra/docker-compose.yml up -d`
- `bun run -w db migrate && bun run -w db seed`
- `bun run -w api dev` and `bun run -w web dev`

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
