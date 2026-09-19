import { useState, type FormEvent } from "react";
import { useAuth } from "../../../providers/AuthProvider";
import { EyeIcon, EyeOffIcon } from "../../../components/icons/PasswordEyeIcon";

const HREP_SEAL = "/images/hrep-seal.png";
const INSPIRE_LOGO = "/images/inspire-logo.png";

function hideOnError(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
}

export function AdminLogin() {
  const { login } = useAuth();
  const [hrepId, setHrepId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(hrepId, password);
    } catch {
      setError("Invalid HREP ID or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center w-full px-4 py-10">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden bg-white border shadow-xl md:grid-cols-2 rounded-2xl border-slate-200">
        {/* -----------------------------------------------------------
         * LEFT — branding panel
         * --------------------------------------------------------- */}
        <div className="flex flex-col justify-between p-10 sm:p-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img
                src={HREP_SEAL}
                alt="House of Representatives Seal"
                onError={hideOnError}
                className="object-contain w-20 h-20"
              />
              <img
                src={INSPIRE_LOGO}
                alt="INSPIRE Program"
                onError={hideOnError}
                className="object-contain h-20"
              />
            </div>

            <p
              className="mb-1 text-lg font-semibold"
              style={{
                color: "#245BA6",
                fontFamily: "var(--smart-font-serif)",
              }}
            >
              Legislative Security Bureau
            </p>

            <h1
              className="text-3xl font-black leading-snug"
              style={{
                fontFamily: "var(--smart-font-sans-alt)",
                color: "#0f172a",
                fontWeight: 800,
              }}
            >
              LSBForms:
              <br />
              Digital Application Form
            </h1>
          </div>

          <p className="mt-10 text-sm italic leading-relaxed text-slate-500">
            "We take pride in belonging to the Office of the Sergeant-at-Arms."
          </p>
        </div>

        {/* -----------------------------------------------------------
         * RIGHT — the form
         * --------------------------------------------------------- */}
        <div className="p-10 border-t sm:p-12 md:border-t-0 md:border-l border-slate-200">
          <h2
            className="mb-6 text-2xl font-bold"
            style={{ fontFamily: "var(--smart-font-sans)", color: "#0f172a" }}
          >
            Administrator Login
          </h2>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 mb-4 text-sm font-medium rounded-lg bg-red-50 text-red-700">
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

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block mb-1 font-bold text-slate-700">
                HREP ID
              </label>
              <input
                type="text"
                autoComplete="username"
                required
                autoFocus
                placeholder="HREP-2020-0001"
                value={hrepId}
                onChange={(e) => setHrepId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border rounded-lg border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-slate-300"
              />
              <label htmlFor="remember" className="text-slate-600">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-3 font-bold tracking-wide text-white rounded-lg bg-slate-900 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "SIGN IN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
