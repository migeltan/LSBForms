import { useState, type FormEvent } from "react";
import { useAuth } from "../../../providers/AuthProvider";
import { EyeIcon, EyeOffIcon } from "../../../components/icons/PasswordEyeIcon";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const HREP_SEAL = `${API_URL}/images/House_of_Representatives_Logo.png`;
const SMART_LOGO = `${API_URL}/images/smart-logo2.png`;

function hideOnError(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
}

export function AdminLogin() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
    } catch {
      setError("Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  }

  // Lock page scroll while the login overlay is mounted.
  return (
    <div className="flex items-start justify-center w-full px-6 py-10 sm:py-14">
      <div
        className="grid w-full max-w-4xl grid-cols-1 self-start overflow-hidden rounded-2xl bg-white md:grid-cols-[1.05fr_1fr]"
        style={{
          boxShadow:
            "0 1px 2px rgba(15,39,68,0.04), 0 24px 48px -16px rgba(15,39,68,0.22)",
        }}
      >
        {/* -----------------------------------------------------------
         * LEFT — branding panel. Shown at every breakpoint (becomes a
         * shorter top banner on mobile when the grid stacks to one
         * column instead of vanishing entirely).
         * --------------------------------------------------------- */}
        <div
          className="relative flex flex-col justify-between px-6 overflow-hidden text-white py-7 sm:px-8 sm:py-8 md:px-10 md:py-9"
          style={{
            background:
              "linear-gradient(150deg, #0f2138 0%, #1c3a5e 55%, #122844 100%)",
          }}
        >
          {/* decorative layers */}
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-[0.10]"
            style={{ background: "#f5b012" }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full opacity-[0.10]"
            style={{ background: "#e0263a" }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.18) 100%)",
            }}
            aria-hidden="true"
          />

          {/* header row */}
          <div className="relative flex items-center gap-3">
            <img
              src={HREP_SEAL}
              alt="House of Representatives Seal"
              onError={hideOnError}
              className="object-contain h-11 w-11 shrink-0 drop-shadow-md sm:h-12 sm:w-12"
            />
            <div className="leading-tight">
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: "#a9bdd6" }}
              >
                Republika ng Pilipinas
              </div>
              <div className="text-[13px] font-bold uppercase tracking-wide text-white">
                House of Representatives
              </div>
            </div>
          </div>

          {/* middle: headline + feature bullets */}
          <div className="relative mt-6 md:mt-8">
            <div
              className="mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: "rgba(245,176,18,0.18)",
                color: "#ffcf5c",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#f5b012]" />
              Restricted Access Portal
            </div>

            <h1
              className="text-xl font-bold leading-snug text-white drop-shadow-sm sm:text-2xl"
              style={{ color: "#ffff" }}
            >
              Admin &amp; Reviewer Console
            </h1>
            <p
              className="mt-2 max-w-[26rem] text-[13px] leading-relaxed"
              style={{ color: "#c3d2e6" }}
            >
              Manage access-pass and vehicle-sticker applications, review
              submissions, and oversee clearance-branch workflows for the SMART
              Internship Program.
            </p>

            <ul className="mt-5 hidden flex-col gap-2.5 sm:flex">
              {[
                "Review and approve applicant submissions",
                "Track access-pass & vehicle-sticker status",
                "Manage clearance-branch workflows",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[13px] text-white/85"
                >
                  <span
                    className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: "rgba(245,176,18,0.2)" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3 h-3"
                      fill="none"
                      stroke="#f5b012"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 12l6 6L20 6" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* footer row */}
          <div className="relative flex items-center justify-between pt-4 border-t mt-7 border-white/10 md:mt-8">
            <img
              src={SMART_LOGO}
              alt="S.M.A.R.T. Internship Program"
              onError={hideOnError}
              className="object-contain w-auto h-8 opacity-95 sm:h-9"
            />
            <span
              className="flex items-center gap-1.5 text-[11px]"
              style={{ color: "#8fa4bd" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Operational
            </span>
          </div>
        </div>

        {/* -----------------------------------------------------------
         * RIGHT — the form
         * --------------------------------------------------------- */}
        <div className="relative flex flex-col justify-center px-8 py-9 sm:px-10">
          <div
            className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: "#fbe2e5", color: "#a3212f" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#e0263a]" />
            Restricted
          </div>

          <h2 className="text-[22px] font-bold tracking-tight text-[#0f2744]">
            Admin / Reviewer Login
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Sign in with your authorized credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#1e3a5f]">
                Username
              </span>
              <input
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-lg border border-[#dbe5f1] bg-[#fafbfd] px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1e3a5f] focus:bg-white focus:ring-4 focus:ring-[#1e3a5f]/10"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#1e3a5f]">
                Password
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#dbe5f1] bg-[#fafbfd] px-3.5 py-2.5 pr-10 text-sm text-gray-900 outline-none transition focus:border-[#1e3a5f] focus:bg-white focus:ring-4 focus:ring-[#1e3a5f]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#1e3a5f]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>

            {error && (
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium"
                style={{ backgroundColor: "#fbe2e5", color: "#a3212f" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16h.01" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #2a5089 0%, #14284a 100%)",
                boxShadow: "0 8px 18px -6px rgba(15,39,68,0.45)",
              }}
            >
              {submitting ? "Signing in…" : "Log in"}
            </button>
          </form>

          <div className="mt-5 flex items-center gap-2 text-[11px] text-gray-500">
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 018 0v3" />
            </svg>
            This portal is for authorized personnel only. All activity is
            logged.
          </div>
        </div>
      </div>
    </div>
  );
}
