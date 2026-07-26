# Production deployment

This document covers the production database and NeoShowcase release procedure.
The root `Dockerfile` builds the React frontend and Go API into one container.

## Required NeoShowcase settings

- Repository: the repository containing this document
- Branch: `main`
- Deploy type: `Runtime`
- Build type: `Dockerfile`
- Dockerfile: `/Dockerfile`
- Internal HTTP port: `8080`
- Health check path: `/healthz`
- Public route: the selected `https://<name>.trap.show` URL

Set these environment variables in NeoShowcase. Do not commit their values.

| Name | Required value |
| --- | --- |
| `APP_ENV` | `production` |
| `DATABASE_URL` | Production MariaDB URL, such as `mariadb://user:password@host:3306/database?tls=true` |
| `FRONTEND_ORIGIN` | Exact public origin, such as `https://<name>.trap.show` |
| `PORT` | `8080` |
| `STATIC_DIR` | `/app/static` |
| `DEBUG` | `false` |

Instead of `DATABASE_URL`, the application also accepts the complete set
`MARIADB_HOST`, `MARIADB_PORT`, `MARIADB_DATABASE`, `MARIADB_USER`, and
`MARIADB_PASSWORD`. The `MYSQL_*` and `DB_*` equivalents are accepted for
managed environments. NeoShowcase's native MariaDB integration is detected
automatically through its `NS_MARIADB_*` variables. Set `MARIADB_TLS` (or its
equivalent) when the database provider requires TLS.

Production startup fails when neither a URL nor a complete MariaDB setting is
present, or when `FRONTEND_ORIGIN` is missing.
The app applies pending files in `backend/migrations` before accepting traffic.

## NeoShowcase website routing

The Dockerfile path and the NeoShowcase deploy type are separate settings. For
this combined image, route `/` to the Runtime Dockerfile application. The Go
server then serves the React build from `STATIC_DIR`, falls back to React only
for page URLs, and preserves HTTP 404 responses for missing APIs and assets.

If a Static deployment owns `/`, NeoShowcase's Caddy server handles the request
before it can reach this application's Go server. Setting
`Is SPA (Single Page Application)` to `Yes` fixes page deep links in that mode,
but Caddy also falls back to `index.html` for missing asset paths. Therefore the
Static mode does not provide this application's API/asset 404 distinction.

When `/apis/...` works but `/array` returns an empty Caddy 404, first check which
application owns `/` and whether the Static application has `Is SPA` enabled.

## Database separation

- Development uses a local MariaDB database and development-only
  `DATABASE_URL`.
- Production uses a separate NeoShowcase or externally managed MariaDB
  database and credentials stored only in NeoShowcase.
- Never point a local `.env` file at the production database.
- Confirm the database name and host before every manual migration, restore, or
  deletion command.

## Retention and stored data

- Generation history stores `recipe_json`, not generated input text.
- History records expire 24 hours after creation.
- The application deletes expired histories at startup and every hour.
- Users can explicitly delete their own active history records and killed cases.
- Presets are retained until a future explicit deletion feature is implemented.

## Backup policy

Before public release, assign an owner for this policy and configure the
database-side job.

- Create a daily logical backup with
  `mariadb-dump --single-transaction --routines --events <database>`.
- Retain 7 daily backups and 4 weekly backups outside the application database.
- Encrypt backup storage and restrict access to the service maintainers.
- Run a restore drill with `mariadb <database> < backup.sql` into a disposable
  database at least once per term.
- Take an on-demand backup before destructive migrations or bulk deletion.

Deleting the production database or its NeoShowcase database resource is not
recoverable unless a tested external backup exists. Application migrations do
not provide a rollback or a backup.

## Release procedure

1. Run backend tests and the frontend production build.
2. Build the root Docker image.
3. Confirm a current backup and restore path.
4. Push the reviewed commit to the branch tracked by NeoShowcase.
5. Confirm the `schema_migrations` table contains every file in
   `backend/migrations`.
6. Check `/healthz` returns HTTP 200 and `"database":"connected"`.
7. Open `/array` directly and reload it, then confirm an unknown page renders the
   React NotFound screen while missing `/apis/...` routes and static assets return
   HTTP 404.
8. Test registration, login, generation history, killed-case save, and preset
   save against production.
9. Monitor logs and database connections after release.
