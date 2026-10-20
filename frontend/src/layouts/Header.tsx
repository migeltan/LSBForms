// Header.tsx
import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, FileText } from "lucide-react";
import { AVAILABLE_FORMS } from "../data/forms";
import { useScrollDirection } from "../hooks/useScrollDirection";

/**
 * Close a popup when the user clicks outside of it or presses Escape.
 */
function useDismiss(
  open: boolean,
  onClose: () => void,
  ref: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, ref]);
}

export function Header() {
  const hidden = useScrollDirection();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Never hide the header while the mobile drawer is open.
  const isHidden = hidden && !mobileOpen;

  return (
    <header className={`lsb-header${isHidden ? " is-hidden" : ""}`}>
      <div className="lsb-header__pattern" aria-hidden="true" />

      <div className="lsb-header__inner">
        {/* ---------- Brand ---------- */}
        <NavLink to="/" className="lsb-brand" aria-label="LSB Forms — Home">
          <span className="lsb-brand__seal">
            <img
              src="/images/hrep-seal.png"
              alt="House of Representatives Seal"
            />
          </span>
          <span className="lsb-brand__text">
            <span className="lsb-brand__title">House of Representatives</span>
            <span className="lsb-brand__sub1">Legislative Security Bureau</span>
            <span className="lsb-brand__sub2">Internal Security Group</span>
          </span>
        </NavLink>

        {/* ---------- Desktop nav ---------- */}
        <nav className="lsb-nav" aria-label="Primary">
          <ul className="lsb-nav__list">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `lsb-nav__link${isActive ? " is-active" : ""}`
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <FormsMenu />
            </li>
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `lsb-nav__link${isActive ? " is-active" : ""}`
                }
              >
                Admin
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* ---------- Mobile toggle ---------- */}
        <button
          type="button"
          className={`lsb-burger${mobileOpen ? " is-open" : ""}`}
          aria-expanded={mobileOpen}
          aria-controls="lsb-mobile-nav"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span className="sr-only">
            {mobileOpen ? "Close navigation" : "Open navigation"}
          </span>
          <span
            className={`lsb-burger__icon${mobileOpen ? " is-open" : ""}`}
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {/* ---------- Mobile / tablet drawer ---------- */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

/**
 * "Forms" dropdown (desktop). Pulled from the shared forms registry, so
 * adding a form in data/forms.ts automatically shows up here.
 */
function FormsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const close = () => setIsOpen(false);
  useDismiss(isOpen, close, wrapRef);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const formsActive = AVAILABLE_FORMS.some((f) =>
    location.pathname.startsWith(f.href),
  );

  return (
    <div className="lsb-forms" ref={wrapRef}>
      <button
        type="button"
        className={`lsb-nav__link lsb-forms__trigger${
          isOpen || formsActive ? " is-active" : ""
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((o) => !o)}
      >
        Forms
        <ChevronDown
          size={15}
          className={`lsb-forms__chevron${isOpen ? " is-open" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="lsb-forms__panel" role="menu">
          <div className="lsb-forms__label">Application Forms</div>
          {AVAILABLE_FORMS.map((form) => (
            <button
              key={form.id}
              type="button"
              role="menuitem"
              className="lsb-forms__item"
              onClick={() => {
                setIsOpen(false);
                navigate(form.href);
              }}
            >
              <span
                className={`lsb-forms__icon lsb-forms__icon--${form.accent}`}
                aria-hidden="true"
              >
                <FileText size={18} />
              </span>
              <span className="lsb-forms__copy">
                <span className="lsb-forms__title">{form.title}</span>
                <span className="lsb-forms__summary">{form.summary}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Mobile / tablet navigation. Rendered inside the sticky header so it
 * slides down from underneath it and always lines up perfectly.
 */
function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLElement | null>(null);

  // Escape closes it (outside tap is handled by the backdrop below).
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `lsb-drawer__link${isActive ? " is-active" : ""}`;

  return (
    <>
      <div
        className={`lsb-backdrop${open ? " is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <nav
        id="lsb-mobile-nav"
        ref={ref}
        className={`lsb-drawer${open ? " is-open" : ""}`}
        aria-label="Mobile"
        aria-hidden={!open}
        // `inert` keeps hidden links out of the tab order.
        {...(!open ? ({ inert: true } as object) : {})}
      >
        <NavLink to="/" end className={linkClass} onClick={onClose}>
          Home
        </NavLink>

        <div className="lsb-drawer__label">Application Forms</div>
        {AVAILABLE_FORMS.map((form) => (
          <NavLink
            key={form.id}
            to={form.href}
            className={linkClass}
            onClick={onClose}
          >
            <span
              className={`lsb-forms__icon lsb-forms__icon--${form.accent}`}
              aria-hidden="true"
            >
              <FileText size={16} />
            </span>
            {form.title}
          </NavLink>
        ))}

        <div className="lsb-drawer__divider" />
        <NavLink to="/admin" className={linkClass} onClick={onClose}>
          Admin
        </NavLink>
      </nav>
    </>
  );
}
