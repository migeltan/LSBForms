// Header.tsx
import { NavLink } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/access-pass", label: "Access Pass" },
  { to: "/vehicle-sticker", label: "Vehicle Sticker" },
  { to: "/status", label: "Check Status" },
];

export function Header() {
  return (
    <header>
      <nav className="navbar-govt">
        <div className="max-w-6xl px-4 mx-auto">
          <div className="flex min-h-[68px] flex-wrap items-center justify-between gap-y-2 py-2">
            <NavLink to="/" className="navbar-brand">
              <img
                src={`${API_URL}/images/House_of_Representatives_Logo.png`}
                alt="House of Representatives seal"
                className="navbar-brand-logo"
              />
              <span className="leading-tight">
                <span className="hidden sm:inline">
                  House of Representatives &mdash; Internal Security Group
                </span>
                <span className="sm:hidden">
                  hob &middot; Internal Security Group
                </span>
              </span>
            </NavLink>

            <ul className="items-center hidden gap-6 md:flex">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `nav-link${isActive ? " active" : ""}`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <NavLink to="/admin" className="nav-link nav-link-admin">
                  Admin
                </NavLink>
              </li>
            </ul>

            <MobileMenu />
          </div>
        </div>
      </nav>
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
          )
        )}
      </ul>
    </details>
  );
}
