<div align="center">

# LSBForms

**Digital Access Pass and Vehicle Sticker application portal for the House of Representatives of the Philippines**

Legislative Security Bureau, Internal Security Group (ISG)

Built by **Migel H. Tan** during the **INSPIRE Internship Program** (formerly SMART Internship Program)

</div>

---

## Introduction

Applying for an Access Pass or a Vehicle Sticker (decal) means paper forms, photocopied requirements and a lot of manual work for ISG staff: checking documents, then cutting, pasting and laminating each pass by hand.

LSBForms provides a centralized online process for submitting application information and supporting documents. It **does not replace** the existing security verification procedures. It digitizes the administrative and document-submission side, and responsible personnel keep full control over screening, validation, approval and issuance.

Once an application is approved and the applicant's photo and information are validated, the system fills an ID template automatically and produces a **print-ready file** (PDF) for authorized personnel to print on PVC cards or sticker sheets.

> **Status:** working prototype. See [Known limitations](#known-limitations).

---

## Project Resources

| Resource         | Link                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| Video demo       | _Add link here_                                                      |
| Project document | _Add link here_                                                      |
| Source code      | [github.com/migeltan/LSBForms](https://github.com/migeltan/LSBForms) |

---

## Screenshots

_Add screenshots here: landing page, Access Pass form, status check, admin dashboard, ID preview._

---

## About the Project

### The problem

- Applications and requirements arrive on paper or by ad-hoc channels, so tracking who applied, and what is still missing, is slow.
- Applicants have no easy way to find out whether their application went through.
- Every approved pass or decal has to be prepared by hand (cutting, pasting, laminating), which is slow and inconsistent.
- Records of who reviewed what, and when, are hard to reconstruct.

### What LSBForms does

- Gives applicants a step-by-step online form for an **Access Pass** or a **Vehicle Sticker**, with document uploads.
- Issues a **reference number** (for example `AP-2026-00001`, `VS-2026-00001`) so applicants can check their status at any time.
- Gives administrators and reviewers a dashboard and review queue for both application types.
- Generates **print-ready Access Pass IDs and vehicle decals** from approved applications.
- Keeps an activity log of reviews, edits and other admin actions.

---

## How It Works

### The applicant journey

1. The applicant opens the portal and picks **Access Pass** or **Vehicle Sticker**.
2. They fill in a **progressive form**. A reference number is reserved up front, and in-progress forms are saved as a local draft for 24 hours.
3. They submit. The system confirms the reference number and sends a confirmation email.
4. At any time they open **Check Status** and enter the reference number plus their last name or email to see the status and dates.
5. They receive an email when the application is approved, rejected or returned for more information.

| Form                | Steps                                             | Who it is for                                                                                |
| ------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Access Pass**     | Personal Info, Background, Documents, Declaration | Congressional staff, consultants, attached agencies, concessionaires, contractors and others |
| **Vehicle Sticker** | Personal Info, Vehicle, Documents                 | House employees applying for a decal for a private vehicle                                   |

**Access Pass applicant types:** Congressional Staff, Consultant, House Member Security, Attached Agency, Concessionaire, Contractor, Security, Temporary ID for Secretariat, Auxiliary Service. Some types need extra documents (for example an NBI clearance, a copy of consultancy, a health certificate, or firearm papers and a duty detail order for House Member Security).

### The reviewer and admin journey

1. Sign in with an HREP ID and password.
2. Open the **dashboard** for an overview of both forms, then the Access Pass or Vehicle Sticker table.
3. Open an application to see personal information, background, documents (previewable and downloadable) and the ID preview.
4. **Decide**: approve, reject, or return it as incomplete, with remarks.
5. For an approved application, **preview and print** the ID or decal.

### Application statuses

| Form            | Statuses                                                                    |
| --------------- | --------------------------------------------------------------------------- |
| Access Pass     | Submitted, Incomplete/Returned, Approved, Rejected                          |
| Vehicle Sticker | Submitted, Under Review, Incomplete/Returned, Approved, Rejected, Completed |

### Roles

| Role         | Can do                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------- |
| **Reviewer** | Review applications, edit applicant details, manage documents, preview and print IDs.        |
| **Admin**    | Everything a reviewer can do, plus create admin/reviewer profiles and view the activity log. |

---

## Key Features

**For applicants**

- Progressive, multi-step forms with a review summary before submitting.
- Reference number reserved before submission, so it is visible throughout the process.
- Drafts saved locally and restored for 24 hours.
- Document uploads (JPG, PNG, PDF, up to 10 MB each), a photo upload, and an on-screen **signature pad** for the Access Pass declaration.
- **Status check** by reference number plus last name or email, with an optional QR scan (on browsers that support it).
- Email notifications on submission and on every decision.

**For reviewers and admins**

- Dashboard with totals, pending, approved and rejected counts and a last-7-days view for each form.
- Separate tables for Access Pass and Vehicle Sticker applications, with search and status badges.
- Review with remarks, edit applicant information, view and replace documents.
- **Manual entry** so staff can encode walk-in applications.
- Admin and reviewer profile management.
- Activity log: status changes, edits, deletions, manual entries and profile additions.

**ID and decal printing**

- Access Pass preview of front and back, printed at 74 x 105 mm, or as a PVC ID at CR80 size (54 x 85.6 mm).
- A QR code carries the application's reference number, with the House seal at its center.
- **Control numbers** assigned on approval (`1AA-1000`, `1AA-1001`, ... for Access Passes; `1000`, `1001`, ... for decals) and never changed on re-print.
- A **layout editor**: each field sits at a percentage-based position, and individual cards can be tweaked and reset without affecting others.
- **Batch download**: several Access Passes as one ZIP of PDFs; approved decals packed onto A4 or Letter sheets (up to 60 per batch).

**Security basics**

- Admin routes are protected by Sanctum token authentication and an active-account check.
- Rate limits on login (5 per minute) and on submissions and status lookups (10 per minute).
- The public status check returns only the type, status and dates. A wrong reference and a wrong second detail give the identical response, so guesses never confirm a reference exists.
- Uploaded files are stored on a private disk and served only through authenticated admin routes.

---

## Tech Stack

| Layer       | Stack                                                                | Path           |
| ----------- | -------------------------------------------------------------------- | -------------- |
| Backend     | Laravel 11, PHP 8.2+, MySQL, Sanctum                                 | `/backend`     |
| Frontend    | React 19, TypeScript, Vite, Tailwind 4, React Query, React Router    | `/frontend`    |
| PDF service | Node.js, Puppeteer, Express (Windows Service on port 4488)           | `/pdf-service` |
| Other       | `endroid/qr-code` (QR codes), Browsershot and Dompdf (PDF rendering) |                |

---

## Setup

**Prerequisites:** PHP 8.2+ and Composer, Node.js 18+ and npm, MySQL. Windows is required only for the PDF service.

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# create a MySQL database (this project uses `lsb_forms`) and set DB_DATABASE and the other DB_* values in .env
php artisan migrate --seed
php artisan storage:link
php artisan serve        # http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:8000/api
npm run dev              # http://localhost:5173
```

### 3. PDF render service

Generates Access Pass and sticker PDFs through a warm background service instead of starting Chromium for every request. Install it once per machine. See [`pdf-service/README.md`](pdf-service/README.md).

### Demo accounts

The seeder creates one administrator:

| HREP ID          | Password      |
| ---------------- | ------------- |
| `HREP-2024-0001` | `Password123` |

This default exists for local development only. Set `ADMIN_SEED_HREP_ID` and `ADMIN_SEED_PASSWORD` in `.env` before seeding anywhere else (seeding in production refuses to run without a password). **Change the password before any demo or deployment.**

---

## Demo Deployment (shareable link)

For demos and feedback only, not permanent hosting. The frontend runs on **Cloudflare Pages**; the backend, MySQL and PDF service run on your own Windows laptop, exposed through an **ngrok** tunnel. If the laptop is off, asleep or offline, the site loads but nothing works.

```
Browser -> Cloudflare Pages (React build)
              | VITE_API_URL
          ngrok static domain (public HTTPS)
              |
          Windows laptop: Laravel + MySQL + pdf-service (127.0.0.1:4488)
```

**Backend `.env`:**

```
APP_URL=https://gainfully-strum-viewpoint.ngrok-free.dev
APP_DEBUG=false
FRONTEND_URL=https://lsbforms.pages.dev
```

`FRONTEND_URL` must match the Pages address exactly (no trailing slash), or CORS will block API calls. After editing `.env`, run `php artisan config:clear` and restart the backend.

**Cloudflare Pages:** root directory `frontend`, build command `npm run build`, output `dist`, and the environment variable:

```
VITE_API_URL=https://gainfully-strum-viewpoint.ngrok-free.dev/api
```

It is baked in at build time, so redeploy after changing it.

**Every time you demo**, keep these running:

1. **MySQL** and the **PDF service** (both Windows services, so they normally start on their own):

   ```powershell
   Get-Service MySQL97
   Get-Service PdfRenderService
   ```

   If either shows `Stopped`: `Start-Service MySQL97` or `Start-Service PdfRenderService`.

2. **The backend** (terminal 1). `php artisan serve` does not bind on this machine, so use the built-in PHP server from `backend/public`:

   ```powershell
   cd D:\LSBForms\backend\public
   php -S 127.0.0.1:9000 ..\vendor\laravel\framework\src\Illuminate\Foundation\resources\server.php
   ```

3. **The tunnel** (terminal 2). Keep it open:

   ```powershell
   ngrok http 9000 --url=gainfully-strum-viewpoint.ngrok-free.dev
   ```

4. **Check both ends.** Each should return `HTTP/1.1 200`:

   ```powershell
   curl.exe -i http://127.0.0.1:9000/up
   curl.exe -i https://gainfully-strum-viewpoint.ngrok-free.dev/up
   ```

   Then open https://lsbforms.pages.dev and sign in.

**Before you present:** use fake applicant data (the system stores uploaded IDs and documents), keep the laptop plugged in with sleep disabled, keep a phone hotspot as backup, and stop the tunnel when you finish.

**Troubleshooting**

| Symptom                            | Likely cause / fix                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| Site loads but login/lookups fail  | ngrok or the PHP server stopped. Restart both.                                    |
| Login shows `CORS` with 0 kB       | Backend or tunnel is not running (the request never reached Laravel).             |
| CORS errors in the browser console | `FRONTEND_URL` does not match the Pages address. Fix it and clear the config.     |
| ngrok `ERR_NGROK_334`              | An old ngrok session is still open. Run `taskkill /IM ngrok.exe /F`, then retry.  |
| API calls go to the wrong address  | `VITE_API_URL` was wrong at build time. Fix it in Cloudflare and redeploy.        |
| PDFs fail to generate              | `PdfRenderService` is not running on the laptop.                                  |
| Database errors after a `git pull` | Run `php artisan migrate` in `backend`.                                           |
| Slow with several testers at once  | The PHP built-in server handles one request at a time. Use Laragon/XAMPP instead. |

---

## Project Structure

```
LSBForms/
|-- backend/        Laravel API: routes, controllers, models, migrations, PDF/QR services
|-- frontend/       React SPA: pages, form modules, admin module, styles
`-- pdf-service/    Local HTML-to-PDF render service used by the backend
```

```
frontend/src/modules/
|-- feat1-access-pass/     Access Pass application form
|-- feat2-vehicle-sticker/ Vehicle Sticker application form
|-- feat3-admin/           Dashboard, tables, review modals, ID preview, layout editor, logs, profiles
`-- feat4-check-status/    Status lookup and QR scan
```

---

## Known Limitations

This is a prototype. Be aware of the following before any real deployment:

- **Personal data:** the system stores applicant identities, photos, signatures and ID documents. Any real use needs a review under the Data Privacy Act of 2012 and a retention policy.
- **Email** needs a configured mailer. Without one, notifications will not be delivered.
- **PDF service** is a Windows Service. The print pipeline needs a Windows host (or porting).
- **QR status scan** works only on browsers that support the `BarcodeDetector` API. Typing the reference number always works.
- **Not a replacement for verification:** approval remains a human decision. The system prepares the print-ready file but does not authenticate documents.
- **Demo hosting** through a laptop and tunnel is not production hosting.
- **Testing:** behavior has been verified through manual runs, not an automated test suite.

---

## Roadmap

- Production hosting with a managed server, backups and monitoring.
- A security review of authentication, file handling and storage.
- Direct integration with the PVC printing workflow and card stock.
- Automated tests for review rules and ID generation.

---

## Credits

Built by **Migel H. Tan** for the **Internal Security Group**, House of Representatives of the Philippines, as part of the **INSPIRE Internship Program**.
