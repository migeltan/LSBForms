# 🛡️ LSBForms — hor_internal-security-group

Digital Access Pass & Vehicle Sticker Application Portal for the
House of Representatives Internal Security Group.

| Layer       | Stack                                        | Path           |
| ----------- | -------------------------------------------- | -------------- |
| Backend     | Laravel 11 + MySQL                           | `/backend`     |
| Frontend    | React + TypeScript + Vite + Tailwind         | `/frontend`    |
| PDF Service | Node + Puppeteer + Express (Windows Service) | `/pdf-service` |

```
hor_internal-security-group/
├── backend/       Laravel API — routes, controllers, models, migrations
├── frontend/      React SPA — pages, components, theme
└── pdf-service/   Local PDF rendering service used by the backend
```

## ✅ Prerequisites

- PHP 8.2+, Composer
- Node.js 18+, npm
- MySQL
- Windows (required only for `pdf-service`)

---

## 1️⃣ Backend

```
cd backend
composer install
cp .env.example .env
php artisan key:generate
# create the `smart_portal` MySQL database, set DB_* in .env
php artisan migrate --seed
php artisan storage:link
```

**Extra packages:**

```
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
composer require spatie/browsershot
composer require endroid/qr-code
composer require dompdf/dompdf
npm install puppeteer
```

**Tailwind (pinned to v3 — v4 breaks the build):**

```
npm uninstall tailwindcss
npm install -D tailwindcss@3
npx tailwindcss init
```

```
php artisan serve   # → http://localhost:8000
```

---

## 2️⃣ Frontend

```
cd frontend
npm install
npm install axios
npm install lucide-react
cp .env.example .env   # VITE_API_URL=http://localhost:8000/api
npm run dev             # → http://localhost:5173
```

---

## 3️⃣ PDF Render Service

- Generates access pass / vehicle sticker PDFs via a background service
  instead of spawning Chromium per request.
- For full installation go to [`pdf-service/README.md`](https://github.com/migeltan/LSBForms/blob/main/pdf-service/README.md)

---

## 4️⃣ Sharing a demo link (laptop must stay on)

This setup is for **demos and feedback only**, not permanent hosting.
The frontend lives on Cloudflare Pages, but the backend, MySQL, and the PDF
service run **on your own Windows laptop** and are exposed through an ngrok
tunnel. If the laptop is off, asleep, offline, or the PHP/ngrok windows are
closed, the site loads but nothing works (no login, no lookups, no PDFs).

```
Browser → Cloudflare Pages (React build, static)
              ↓  VITE_API_URL
          ngrok static domain (public HTTPS)
              ↓
          Your Windows laptop:
          Laravel (port 9000) + MySQL + pdf-service (127.0.0.1:4488)
```

### One-time setup

**ngrok**

1. Create a free account at ngrok.com and run `ngrok config add-authtoken <token>`.
2. In the ngrok dashboard → **Domains**, claim your free static domain
   (looks like `something.ngrok-free.dev`). It stays the same across restarts.

**Backend `.env`** (`backend/.env`)

```
APP_URL=https://<your-domain>.ngrok-free.dev
APP_DEBUG=false
FRONTEND_URL=https://<your-project>.pages.dev
```

Then run `php artisan config:clear`. `FRONTEND_URL` must match the Pages
address exactly (no trailing slash), or the browser will block API calls (CORS).

**Already handled in the repo**

- `backend/bootstrap/app.php` trusts the ngrok proxy (`trustProxies`), so
  generated links use `https://`.
- `frontend/src/api/client.ts` sends the `ngrok-skip-browser-warning` header so
  ngrok's interstitial page doesn't break API responses.
- `frontend/public/_redirects` makes page refreshes work on Cloudflare Pages.

**Cloudflare Pages** (Workers & Pages → Create → Pages → Connect to Git)

| Setting                | Value                                                       |
| ---------------------- | ----------------------------------------------------------- |
| Production branch      | `main`                                                      |
| Root directory         | `frontend`                                                  |
| Build command          | `npm run build`                                             |
| Build output directory | `dist`                                                      |
| Environment variable   | `VITE_API_URL` = `https://<your-domain>.ngrok-free.dev/api` |

`VITE_API_URL` is baked in at build time. If you change it, redeploy the site.
Every push to `main` redeploys the frontend automatically.

### Every time you want people to test

Keep all of these running, in this order:

1. **MySQL** is running.
2. **PDF service** is running (Administrator PowerShell):
   ```
   Get-Service PdfRenderService
   ```
   If missing or broken, re-run `pdf-service/install.ps1`.
3. **Backend** (window 1):
   ```
   cd backend/public
   php -S 127.0.0.1:9000 ..\vendor\laravel\framework\src\Illuminate\Foundation\resources\server.php
   ```
   (`php artisan serve` also works if it can bind a port on your machine; the
   command above is the fallback when it fails with "Failed to listen".)
4. **Tunnel** (window 2):
   ```
   ngrok http --domain=<your-domain>.ngrok-free.dev 9000
   ```
   It should show `Session Status: online`. Inspect traffic at http://127.0.0.1:4040.
5. Share the `https://<your-project>.pages.dev` link.

Tip: set Windows to not sleep while plugged in during the demo.

### Troubleshooting

| Symptom                                            | Likely cause / fix                                                                                                                             |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Site loads, but login and lookups fail             | ngrok window closed, or PHP server stopped. Restart steps 3 and 4. Check http://127.0.0.1:4040 for incoming requests.                          |
| `No application encryption key has been specified` | Run `php artisan key:generate` then `php artisan config:clear`.                                                                                |
| Browser console shows CORS errors                  | `FRONTEND_URL` in `backend/.env` doesn't match the Pages address. Fix it, then `php artisan config:clear`.                                     |
| API calls go to the wrong address                  | `VITE_API_URL` was wrong at build time. Fix it in Cloudflare and redeploy.                                                                     |
| Links or images use `http://`                      | Check `APP_URL` is the `https://` ngrok address and `trustProxies` is present in `bootstrap/app.php`.                                          |
| PDFs fail to generate                              | `PdfRenderService` isn't running on the laptop.                                                                                                |
| Slow when several people test at once              | The PHP built-in server handles one request at a time on Windows. Run the backend through Laragon/XAMPP (Apache) and point ngrok at that port. |
| ngrok free limits                                  | About 20,000 requests/month and 1 GB bandwidth. Fine for a small group of reviewers.                                                           |

### Demo safety

- Change the seeded admin login before sharing the link (see below).
- Tell testers to use **dummy data** — applicants can upload IDs and documents.
- Keep `APP_DEBUG=false` while the tunnel is public.
- Stop the tunnel (`Ctrl+C` in the ngrok window) when you're done.

---

## 🔑 Default login

```
admin / Password123
```

⚠️ **Change this before any demo or deployment.**

---

## 📦 What's included

- ✅ Full DB schema as Laravel migrations (users, applicants, access pass, vehicle, documents, logs)
- ✅ Eloquent models with relationships wired up
- ✅ API routes/controllers: access pass, vehicle sticker, document upload, status lookup, admin review (Sanctum auth)
- ✅ React shell — `App → AppRoutes → Layout`, with Theme/Query/Auth/Breadcrumb providers + toasts
- ✅ Pages: Home, Access Pass, Vehicle Sticker, Check Status, Admin
- ✅ Full SMART Portal design system ported to `theme-smart.css`
- ✅ Official logos wired into navbar/hero/footer
- ✅ PDF pipeline: Browsershot + render service, QR codes (`endroid/qr-code`), Dompdf fallback

## 🚧 Not included yet

- ⬜ Multi-step form fields for Access Pass / Vehicle Sticker
- ⬜ Document upload UI (`POST /api/documents` ready)
- ⬜ Admin review queue UI (`GET /api/admin/applications` ready)
- ⬜ 2x2 photo capture/cropping
