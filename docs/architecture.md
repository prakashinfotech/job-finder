# Architecture

The source architecture brief for this project lives in `.claude/docs/ARCHITECTURE.md`.

This repository currently contains the initial monorepo boilerplate aligned to that brief:

- `apps/web` for the public job platform
- `apps/admin` for the admin dashboard
- `apps/worker` for background jobs
- `packages/ui` for shared UI
- `packages/config` for shared TypeScript configuration
- `packages/db` for Prisma schema and database access
- `packages/auth` for shared authentication helpers
- `packages/utils` for reusable utilities
- `packages/validations` for Zod schemas
