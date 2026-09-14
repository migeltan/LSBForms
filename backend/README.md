# SMART Portal — Backend (Laravel)

API for the House of Representatives — Internal Security Group SMART Portal
(Access Pass & Vehicle Sticker applications). Laravel 11 + MySQL.

This scaffold was hand-written (not generated via `composer create-project`,
since this environment has no access to Packagist) — it's a complete,
correct Laravel 11 file layout, but you need to run `composer install`
once on a machine with internet access before it will boot.

## Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Create the database (matches schema.sql / config/database.php)
mysql -u root -p -e "CREATE DATABASE smart_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Point .env DB_* vars at your MySQL instance, then:
php artisan migrate
php artisan db:seed          # creates the admin/ChangeMe123! account
php artisan storage:link     # so uploaded documents are served publicly

php artisan serve            # http://localhost:8000
```

The included `database/migrations/*` recreate the exact schema from the
original `schema.sql` (same tables, columns, enums, and foreign keys).
If you'd rather run the raw SQL file directly instead of Laravel
migrations, that works too — just make sure `migrations` table bookkeeping
is skipped or backfilled accordingly.

## Default admin account

- Username: `admin`
- Password: `ChangeMe123!`

**Change this before showing the prototype to anyone** — see
`database/seeders/AdminUserSeeder.php`.

## API overview

All routes are under `/api` (see `routes/api.php`):

| Method | Route                                | Purpose                                      |
| ------ | ------------------------------------ | -------------------------------------------- |
| POST   | `/auth/login`                        | Admin/reviewer login (returns Sanctum token) |
| POST   | `/access-pass`                       | Create an access pass application            |
| GET    | `/access-pass/{id}`                  | Fetch one (with family/education/documents)  |
| POST   | `/access-pass/{id}/submit`           | Move Draft → Submitted                       |
| POST   | `/vehicle-sticker`                   | Create a vehicle sticker application         |
| GET    | `/vehicle-sticker/{id}`              | Fetch one                                    |
| POST   | `/vehicle-sticker/{id}/submit`       | Move Draft → Submitted                       |
| POST   | `/documents`                         | Upload a supporting document                 |
| GET    | `/status/{reference}`                | Public status check (AP-... / VS-...)        |
| GET    | `/admin/applications`                | Combined review queue (auth + admin)         |
| PATCH  | `/admin/access-pass/{id}/review`     | Approve/reject/return                        |
| PATCH  | `/admin/vehicle-sticker/{id}/review` | Approve/reject/return, assign sticker #      |

CORS is configured in `config/cors.php` to allow the Vite dev server
(`FRONTEND_URL`, default `http://localhost:5173`).

## Notes

- Auth uses Laravel Sanctum's **token** guard (Bearer tokens), matching
  `frontend/src/api/client.ts`'s `Authorization: Bearer <token>` header —
  not the cookie-based SPA guard, so no CSRF cookie dance is required.
- `documents.application_id` is a plain string reference (not a foreign
  key) since one document can belong to either an access pass or a
  vehicle sticker application — this mirrors the original schema note.
