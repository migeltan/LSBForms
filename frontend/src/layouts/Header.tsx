// Header.tsx
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { AVAILABLE_FORMS } from "../data/forms";
import { useScrollDirection } from "../hooks/useScrollDirection";

const navItems = [{ to: "/", label: "Home", end: true }];

export function Header() {
  const hidden = useScrollDirection();

  return (
    <header className={`gov-header${hidden ? " gov-header-hidden" : ""}`}>
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
              <span className="gov-brand-title">House of Representatives</span>
              <span className="gov-brand-subtitle-1">
                Legislative Security Bureau
              </span>
              <span className="gov-brand-subtitle-2">
                Internal Security Group
              </span>
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
              <FormsMenu />
            </li>
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

/**
 * "Forms" nav item: a popup listing every available application form,
 * pulled from the shared forms registry. Keeps the header scalable —
 * adding a new form later only means adding an entry in data/forms.ts,
 * not touching the header again.
 */
function FormsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="forms-menu" ref={wrapRef}>
      <button
        type="button"
        className={`gov-nav-link forms-menu-trigger${isOpen ? " is-active" : ""}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        Forms
        <ChevronDown
          size={14}
          className={`forms-menu-chevron${isOpen ? " is-open" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="forms-menu-panel" role="menu">
          <div className="forms-menu-panel-label">Application Forms</div>
          {AVAILABLE_FORMS.map((form) => (
            <button
              key={form.id}
              type="button"
              role="menuitem"
              className="forms-menu-item"
              onClick={() => {
                setIsOpen(false);
                navigate(form.href);
              }}
            >
              <span className="forms-menu-item-title">{form.title}</span>
              <span className="forms-menu-item-summary">{form.summary}</span>
            </button>
          ))}
        </div>
      )}
    </div>
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
        {[
          ...navItems,
          ...AVAILABLE_FORMS.map((form) => ({
            to: form.href,
            label: form.title,
            end: false,
          })),
          { to: "/admin", label: "Admin", end: false },
        ].map((item) => (
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
        ))}
      </ul>
    </details>
  );
}
