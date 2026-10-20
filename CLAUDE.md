# LSBForms: context for Claude

Read this briefly, then continue from Next. Do not re-ask decided items or re-inspect files this file already describes. Conserve tokens.

## Start here (every new conversation)

1. Sync the clone (section 2). Read-only: no installs, no downloads.
2. Run the Verify commands (section 5) to see what has landed on main.
3. Reply with one short line: current state and what you will do next. Then work on Next.

Kickoff prompt: "Continue LSBForms. Clone main, read /CLAUDE.md, verify status, continue from Next."

## 1. How we work

Phases: understand (no code) -> discuss (no code) -> implement only when he explicitly says so ("go", "next"). One feature at a time, in small steps. Present exact snippets grouped by file in implementation order: `Replace this:` (existing code, verbatim) then `with this:`. New file or heavy rewrite: exact path, one-line reason, full contents. No unrelated refactors.
He applies changes himself (Windows, Laravel Herd, `D:\LSBForms`). No output files unless he asks (CLAUDE.md is the exception: downloadable .md). Code goes in chat.
Match files by content (indentation can be inconsistent). If a snippet cannot match, ask him to paste the file, then return it in full. If a change can alter live behaviour before its supporting screen exists, order the steps so the behaviour change comes last.
State manual steps explicitly (commands, `.env` keys, migrations, imports). After pulling on the demo machine: `php artisan migrate`, `php artisan config:clear`, restart the PHP server. Changing `VITE_API_URL` needs a Cloudflare Pages redeploy (build-time value).
Cannot run PHP, npm, tests, a browser or the app (no vendor/, no node_modules/). Verify by applying each snippet to a scratch copy with an exact-match script (each "Replace this" must match once), brace-count PHP/CSS/TSX, and `node --check` extracted plain JS. Say "syntax-checked" vs "not run". He runs the app and sends screenshots, DevTools output or `backend/storage/logs/laravel.log` lines.
Tokens: `grep -n`, `sed -n` ranges only; never cat big files. Concise replies, at most one question per reply (prefer a stated default).
Be direct; flag risks and unverified guesses honestly.

## 2. Seeing the code

```
mkdir -p /home/claude/migeltan && cd /home/claude/migeltan
[ -d lsbforms ] || git clone --depth 1 https://github.com/migeltan/LSBForms.git lsbforms
cd lsbforms && git fetch --depth 15 origin main && git reset --hard FETCH_HEAD && git log --oneline -5
```

Read-only reference; never push. Default branch is `main`. It shows only what is pushed; his local copy can be ahead (treat unpushed work as intentional). If he says he applied something not visible, ask him to push or paste it.
Never run `composer install`, `npm install`, `pip install`. Ignore `vendor/`, `node_modules/`, `pdf-service/` internals and the stock `backend/README.md` / `frontend/README.md` if still present.

## 3. Project

Digital Access Pass and Vehicle Sticker (decal) application portal for the House of Representatives of the Philippines, Legislative Security Bureau, Internal Security Group (ISG). Built by Migel H. Tan (INSPIRE Internship, formerly SMART). It digitizes forms, document submission and print-ready ID/decal generation. It does NOT replace security verification: approval stays a human decision.

Flow (loop): applicant picks a form -> progressive form (reference number reserved up front, local draft for 24 h) -> submit (confirmation email) -> reviewer/admin reviews, with remarks: approve / reject / return as incomplete -> approved: control number assigned, ID or decal previewed and printed -> applicant checks status any time (reference number + last name or email) and gets an email on every decision.

Forms: **Access Pass** (4 steps: Personal Info, Background, Documents, Declaration with signature pad). Applicant types: Congressional Staff, Consultant, House Member Security, Attached Agency, Concessionaire, Contractor, Security, Temporary ID for Secretariat, Auxiliary Service; some types need extra documents. **Vehicle Sticker** (3 steps: Personal Info, Vehicle, Documents; House employees, private vehicles).
Stack: Laravel 11 / PHP 8.2+, MySQL, Sanctum (`/backend`); React 19 + TypeScript + Vite + React Query + React Router + Tailwind (README says 4; an older README pinned v3 because v4 broke the build: trust `frontend/package.json`) (`/frontend`); Node + Puppeteer + Express PDF service as a Windows Service `PdfRenderService` on 127.0.0.1:4488 (`/pdf-service`). Also `endroid/qr-code`, Browsershot (Dompdf fallback). Local ports: API http://localhost:8000, Vite http://localhost:5173, `VITE_API_URL=http://localhost:8000/api`.
Seed: one admin, HREP ID `HREP-2024-0001` / `Password123` (override with `ADMIN_SEED_HREP_ID` / `ADMIN_SEED_PASSWORD`; seeding in production refuses to run without a password). Login is by HREP ID + password.

## 4. Decisions / rules already made (do not re-ask)

Roles: Reviewer = review, edit applicant details, manage documents, preview/print IDs. Admin = everything a reviewer can, plus create admin/reviewer profiles and view the activity log.
Reference numbers: `AP-2026-00001` (Access Pass), `VS-2026-00001` (Vehicle Sticker), reserved before submission. Control numbers assigned on approval (`1AA-1000`, `1AA-1001`... for passes; `1000`, `1001`... for decals), never changed on re-print.
Statuses: Access Pass = Submitted, Incomplete/Returned, Approved, Rejected. Vehicle Sticker = Submitted, Under Review, Incomplete/Returned, Approved, Rejected, Completed.
Public status check returns only type, status and dates; a wrong reference and a wrong second detail give the identical response (never confirm a reference exists). Optional QR scan uses `BarcodeDetector` (typing always works).
Security: Sanctum token auth + active-account check on admin routes. Rate limits: login 5/min; submissions and status lookups 10/min. Uploads (JPG, PNG, PDF, max 10 MB each, plus photo and signature) live on a private disk and are served only through authenticated admin routes.
Printing: Access Pass front/back at 74 x 105 mm, or PVC at CR80 (54 x 85.6 mm); QR carries the reference number with the House seal in the centre. Layout editor uses percentage-based positions; per-card tweaks and resets must not affect other cards. Batch: Access Passes as a ZIP of PDFs; decals packed on A4 or Letter (max 60 per batch).
Admin extras: dashboard (totals, pending/approved/rejected, last 7 days), separate Access Pass and Vehicle Sticker tables with search and status badges, manual entry for walk-ins, document view/replace, activity log (status changes, edits, deletions, manual entries, profile additions).

## 5. Where things are and status

```
backend/       Laravel API: routes, controllers, models, migrations, PDF/QR services
frontend/src/modules/
  feat1-access-pass/      Access Pass form
  feat2-vehicle-sticker/  Vehicle Sticker form
  feat3-admin/            dashboard, tables, review modals, ID preview, layout editor, logs, profiles
  feat4-check-status/     status lookup + QR scan
pdf-service/   HTML-to-PDF render service used by the backend (see pdf-service/README.md)
```

Heavy files: `grep -n` first; the admin module and ID preview/layout editor are the largest areas.
Status (2026-10-20): working prototype; manual testing only (no automated suite). Demo deployed: frontend on Cloudflare Pages (`https://lsbforms.pages.dev`; root `frontend`, build `npm run build`, output `dist`), backend on his laptop behind an ngrok static domain.

Verify (run in the clone; route/migration file names assumed, adjust if they differ):

```
cd /home/claude/migeltan/lsbforms && git log --oneline -3
ls frontend/src/modules                      # expect feat1..feat4
ls backend/database/migrations | tail -5     # newest migrations
ls backend/routes && grep -c "Route::" backend/routes/*.php
```

Demo run (every time, details in README "Demo Deployment"): services `MySQL97` and `PdfRenderService` running; terminal 1 `cd D:\LSBForms\backend\public` then `php -S 127.0.0.1:9000 ..\vendor\laravel\framework\src\Illuminate\Foundation\resources\server.php`; terminal 2 `ngrok http 9000 --url=gainfully-strum-viewpoint.ngrok-free.dev`. Backend `.env`: `APP_URL` = ngrok URL, `FRONTEND_URL=https://lsbforms.pages.dev` (exact, no trailing slash), DB is `lsb_forms` on 127.0.0.1:3306. Pages env: `VITE_API_URL=https://gainfully-strum-viewpoint.ngrok-free.dev/api`.
Gotchas: `php artisan serve` does not bind on his machine (use the `php -S` command). DevTools `CORS` with 0 kB on login usually means the backend or tunnel is down, not a CORS bug. Check `laravel.log` timestamps before trusting an old error. Frontend login may show a generic "Invalid HREP ID or password" for any failed request (unverified).

## 6. Next (user's queue, one at a time; say "go" before each)

(empty: fill in before the next conversation)

## 7. Known risks (state them, do not hide them)

Default seeded admin password is public in the README; change it before any demo or deployment. Never put real DB passwords or tokens in repo files (the repo is public).
The system stores applicant identities, photos, signatures and ID documents: any real use needs a Data Privacy Act of 2012 review and a retention policy. Demos use fake data only.
Email needs a configured mailer; without one, notifications are not delivered.
PDF service is a Windows Service; the print pipeline needs a Windows host (or porting).
The PHP built-in server handles one request at a time and stops when the laptop sleeps or the terminal closes; demo hosting is not production hosting. A static ngrok domain is tied to one account.
README Tailwind version (4) conflicts with an older note (pinned v3): confirm in `frontend/package.json` before touching styles.
Frontend env values are baked in at build time (`VITE_API_URL`): a wrong value needs a redeploy, not a restart.

## 8. Updating this file

Only when the conversation nears ~90% usage, he says it is ending, or he asks: update sections 4-7 only, deliver the full file once as a downloadable .md (keep it dense, under ~130 lines, drop stale detail), and remind him to commit it to the repo root and push to main so a fresh clone sees it.
