// Footer.tsx
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="pt-8 pb-6 mt-12 footer-govt">
      <span className="footer-corner-shape" aria-hidden="true" />
      <div className="max-w-6xl px-4 mx-auto">
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <img
              src="/images/hrep-seal.png"
              alt="House of Representatives Seal"
              className="footer-logo-img"
            />
            <img
              src="/images/inspire-logo.png"
              alt="INSPIRE — Internship for Service, Public Leadership, Innovation, and Research Excellence"
              className="footer-logo-img"
            />
            {/* LSB seal — not yet public. Once the file is added to
                frontend/public/images/, uncomment: */}
            <img
              src="/images/lsb-seal.png"
              alt="Legislative Security Bureau Seal"
              className="footer-logo-img"
            />
          </div>

          <div className="text-center md:text-right">
            <div className="text-[var(--smart-fs-sm)] font-medium text-[var(--smart-ink)]">
              Made by Migel H. Tan, 2026 INSPIRE Intern
            </div>
            <div className="mt-1.5 text-[var(--smart-fs-sm)] text-[var(--smart-muted)]">
              &copy; {year} Legislative Security Bureau, Internal Security
              Group. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
