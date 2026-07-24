# Backend development

## Start

```powershell
go run .
```

## Authentication storage

When `DATABASE_URL` is set, users, sessions, Random Gen histories, killed cases,
and presets are stored in MariaDB. Required tables are created at startup.

```powershell
$env:DATABASE_URL='mariadb://<user>:<password>@localhost:3306/<database>'
$env:FRONTEND_ORIGIN='http://localhost:3000'
go run .
```

When `DATABASE_URL` is not set, authentication and saved recipes use in-memory
development storage and are cleared when the backend stops.

Set `APP_ENV=production` in production to enable the `Secure` attribute on the
session cookie.
