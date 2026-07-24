# Production deployment

This document covers the production database and NeoShowcase release procedure.
The root `Dockerfile` builds the React frontend and Go API into one container.

## Required NeoShowcase settings

- Repository: the repository containing this document
- Branch: `main`
- Dockerfile: `/Dockerfile`
- Internal HTTP port: `8080`
- Health check path: `/healthz`
- Public route: the selected `https://<name>.trap.games` URL

Set these environment variables in NeoShowcase. Do not commit their values.

| Name | Required value |
| --- | --- |
| `APP_ENV` | `production` |
| `DATABASE_URL` | Production PostgreSQL connection URL |
| `FRONTEND_ORIGIN` | Exact public origin, such as `https://<name>.trap.games` |
| `PORT` | `8080` |
| `STATIC_DIR` | `/app/static` |
| `DEBUG` | `false` |

Production startup fails when `DATABASE_URL` or `FRONTEND_ORIGIN` is missing.
The app applies pending files in `backend/migrations` before accepting traffic.

## Database separation

- Development uses a local PostgreSQL database and a development-only
  `DATABASE_URL`.
- Production uses a separate NeoShowcase or externally managed PostgreSQL
  database and credentials stored only in NeoShowcase.
- Never point a local `.env` file at the production database.
- Confirm the database name and host before every manual migration, restore, or
  deletion command.

## Retention and stored data

- Generation history stores `recipe_json`, not generated input text.
- History records expire 24 hours after creation.
- The application deletes expired histories at startup and every hour.
- Killed cases and presets are retained until a future explicit deletion
  feature is implemented.

## Backup policy

Before public release, assign an owner for this policy and configure the
database-side job.

- Create a daily logical PostgreSQL backup with `pg_dump --format=custom`.
- Retain 7 daily backups and 4 weekly backups outside the application database.
- Encrypt backup storage and restrict access to the service maintainers.
- Run a restore drill into a disposable database at least once per term.
- Take an on-demand backup before destructive migrations or bulk deletion.

Deleting the production database or its NeoShowcase database resource is not
recoverable unless a tested external backup exists. Application migrations do
not provide a rollback or a backup.

## Release procedure

1. Run backend tests and the frontend production build.
2. Build the root Docker image.
3. Confirm a current backup and restore path.
4. Push the reviewed commit to the branch tracked by NeoShowcase.
5. Confirm startup logs show all migrations completed.
6. Check `/healthz` returns HTTP 200 and `"database":"connected"`.
7. Test registration, login, generation history, killed-case save, and preset
   save against production.
8. Monitor logs and database connections after release.
