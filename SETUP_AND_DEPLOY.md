# NOVA Dental — Setup & Deployment

Cloudflare Worker (`src/index.js`) + static assets + D1. No framework migration was made.

## 1. Back up, then migrate
```bash
wrangler d1 export dental --remote --output backup-before-ultimate.sql   # ALWAYS first
wrangler d1 migrations apply dental --remote
```
Migrations added in this release (all additive; no existing row is changed or deleted):

| File | Purpose |
|---|---|
| `0001_baseline_reconstructed.sql` | **Reconstructed** `appointments`, `appointment_rate_limits`, `admin_login_attempts` (they were missing from the ZIP; inferred from code). All `IF NOT EXISTS`. **Compare with your live schema first** (`wrangler d1 execute dental --remote --command ".schema"`). If the live `appointments` table differs (e.g. extra NOT NULL columns), adjust before applying. |
| `0004_platform_core.sql` | services, dentists, dentist_services, working_hours, time_off, settings, audit_logs, admin_users, admin_sessions; new appointment columns; **replaces the clinic-wide overlap triggers with per-dentist ones**. |
| `0005_booking_tokens.sql` | hashed self-service manage tokens. |

`0002` and `0003` were already in the project. If your D1 was created by hand and `d1_migrations` does not list them, wrangler will try to apply them; `0002` uses `ALTER TABLE ADD COLUMN` which is not idempotent — mark them applied or skip as appropriate.

## 2. Secrets
```bash
wrangler secret put RATE_LIMIT_SECRET       # >= 32 random chars
wrangler secret put ADMIN_USERNAME          # bootstrap only
wrangler secret put ADMIN_PASSWORD          # bootstrap only (12+ chars)
# optional email (booking works without it):
wrangler secret put EMAIL_API_KEY ; wrangler secret put EMAIL_FROM ; wrangler secret put CLINIC_NOTIFY_EMAIL
```
`ADMIN_SESSION_SECRET` is **no longer used** (sessions are now server-side in D1). See `.dev.vars.example`.

First login at `/admin` with the bootstrap credentials creates the first admin with a PBKDF2-SHA256 hash. Afterwards: create named accounts under **إعداد العيادة → المستخدمون**, change the password, and delete `ADMIN_USERNAME`/`ADMIN_PASSWORD` (they are ignored once any admin exists).

## 3. Configure the clinic (in /admin → إعداد العيادة)
The platform ships with **no invented clinic data**. Online booking stays hidden on the public site (the classic request form remains) until you enter:
1. Dentists (real names/titles) and which services each performs.
2. Working hours (clinic default and/or per dentist).
3. Settings: timezone (default `Africa/Algiers`), slot step, minimum notice, booking window.
Then confirm **تفعيل الحجز المباشر** is on.

## 4. Deploy
```bash
npm test                 # unit/integration tests (Node 22+)
wrangler deploy          # only after you have tested on a preview
```
Verify: `/api/health`, `/admin` login, `/api/booking/options`, a test booking → confirm in admin → cancel via the manage link, `/robots.txt`, `/sitemap.xml`.

## Roles
`admin`: everything. `staff`: appointments, patients, visits, reports, read-only configuration; no settings/users/audit.
