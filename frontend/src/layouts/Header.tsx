// Header.tsx
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/access-pass", label: "Access Pass" },
  { to: "/vehicle-sticker", label: "Vehicle Sticker" },
  { to: "/status", label: "Check Status" },
];

export function Header() {
  return (
    <header className="gov-header">
      <div className="gov-header-pattern" aria-hidden="true" />
      <div className="gov-header-inner max-w-6xl px-4 mx-auto">
        <div className="flex min-h-[88px] flex-wrap items-center justify-between gap-y-5 py-7">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="gov-brand-logo">
              <img
                src="/images/hrep-seal.png"
                alt="House of Representatives Seal"
              />
            </span>
            <span className="leading-tight">
              <span className="gov-brand-subtitle-1">
                Legislative Security Bureau
              </span>
              <span className="gov-brand-title">House of Representatives</span>
            </span>
          </NavLink>

          <ul className="gov-nav items-center hidden gap-6 md:flex">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `gov-nav-link${isActive ? " is-active" : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `gov-nav-link${isActive ? " is-active" : ""}`
                }
              >
                Admin
              </NavLink>
            </li>
          </ul>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

function MobileMenu() {
  return (
    <details className="relative md:hidden">
      <summary className="list-none cursor-pointer rounded border border-white/20 px-3 py-2 text-white [&::-webkit-details-marker]:hidden">
        <span className="sr-only">Toggle navigation</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 5h16M2 10h16M2 15h16"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </summary>
      <ul className="absolute right-0 top-12 z-50 w-56 rounded-md border border-[var(--smart-border)] bg-white p-2 shadow-lg">
        {[...navItems, { to: "/admin", label: "Admin", end: false }].map(
          (item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block rounded px-3 py-2 text-sm ${
                    isActive
                      ? "bg-[var(--smart-blue-light)] text-[var(--smart-blue-dark)] font-semibold"
                      : "text-[var(--smart-ink)]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ),
        )}
      </ul>
    </details>
  );
}
