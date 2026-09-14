// Footer.tsx
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="pt-8 pb-6 mt-12 footer-govt"
      style={{ borderTop: "3px solid var(--smart-yellow)" }}
    >
      <span className="footer-corner-shape" aria-hidden="true" />
      <div className="max-w-6xl px-4 mx-auto">
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <img
              src={`${API_URL}/images/smart-logo2.png`}
              alt="SMART Program — House of Representatives"
              className="footer-logo-img"
            />
            <span
              className="hidden h-8 w-px bg-[var(--smart-border)] sm:block"
              aria-hidden="true"
            />
            <div className="items-center hidden gap-3 sm:flex">
              <img
                src={`${API_URL}/images/House_of_Representatives_Logo.png`}
                alt="House of Representatives seal"
                className="w-8 h-8 shrink-0"
              />
              <img
                src={`${API_URL}/images/Philippine_Logo.webp`}
                alt="Republic of the Philippines coat of arms"
                className="w-8 h-8 shrink-0"
              />
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="text-[var(--smart-fs-sm)] text-[var(--smart-muted)]">
              <Link to="/" className="footer-link">
                Home
              </Link>
              <span className="footer-link-sep">&middot;</span>
              <Link to="/status" className="footer-link">
                Check Status
              </Link>
            </div>
            <div className="mt-2 text-[var(--smart-fs-sm)] text-[var(--smart-muted)]">
              &copy; {year} House of Representatives &mdash; Internal Security
              Group. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
