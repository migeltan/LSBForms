# 🛡️ SMART Portal — hor_internal-security-group

Digital Access Pass & Vehicle Sticker Application Portal for the
House of Representatives Internal Security Group.

| Layer       | Stack                                        | Path           |
| ----------- | -------------------------------------------- | -------------- |
| Backend     | Laravel 11 + MySQL                           | `/backend`     |
| Frontend    | React + TypeScript + Vite + Tailwind         | `/frontend`    |
| PDF Service | Node + Puppeteer + Express (Windows Service) | `/pdf-service` |

kmonnlnlnk
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

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# create the `smart_portal` MySQL database, set DB_* in .env
php artisan migrate --seed
php artisan storage:link
```

**Extra packages:**

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
composer require spatie/browsershot
composer require endroid/qr-code
composer require dompdf/dompdf
npm install puppeteer
```

**Tailwind (pinned to v3 — v4 breaks the build):**

```bash
npm uninstall tailwindcss
npm install -D tailwindcss@3
npx tailwindcss init
```

```bash
php artisan serve   # → http://localhost:8000
```

---

## 2️⃣ Frontend

```bash
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
- For full instalation go to [`pdf-service/README.md`](./pdf-service/README.md)

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
