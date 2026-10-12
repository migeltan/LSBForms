import { useState, type FormEvent } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { useAuth } from "../../../providers/AuthProvider";

const INSPIRE_LOGO = "/images/inspire-logo.png";
const LSB_SEAL = "/images/lsb-seal.png";

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

  // Only auto-focus on larger screens — on phones it pops the keyboard
  // open immediately and hides the card.
  const autoFocus =
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches;

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
    <section className="lsb-login" aria-labelledby="lsb-login-title">
      <div className="lsb-login__card">
        {/* ------------------------------------------------------------
         * Brand panel (top on mobile, left on desktop)
         * ---------------------------------------------------------- */}
        <aside className="lsb-login__brand">
          <div className="lsb-login__logos">
            <img
              src={LSB_SEAL}
              alt="Legislative Security Bureau Seal"
              onError={hideOnError}
            />
            <span className="lsb-login__logo-divider" aria-hidden="true" />
            <img
              src={INSPIRE_LOGO}
              alt="INSPIRE Program"
              onError={hideOnError}
              className="lsb-login__logo-inspire"
            />
          </div>

          <div className="lsb-login__brand-copy">
            <p className="lsb-login__eyebrow">Legislative Security Bureau</p>
            <h1 className="lsb-login__title">
              LSBForms:
              <span>Digital Application Form</span>
            </h1>
          </div>

          <p className="lsb-login__quote">
            “We take pride in belonging to the Office of the Sergeant-at-Arms.”
          </p>
        </aside>

        {/* ------------------------------------------------------------
         * Form panel
         * ---------------------------------------------------------- */}
        <div className="lsb-login__panel">
          <div className="lsb-login__panel-inner">
            <h2 id="lsb-login-title" className="lsb-login__heading">
              Administrator Login
            </h2>
            <p className="lsb-login__hint">
              Sign in with your HREP ID to access the admin dashboard.
            </p>

            {error && (
              <div className="lsb-login__error" role="alert">
                <AlertCircle size={18} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="lsb-login__form">
              <div className="lsb-field">
                <label htmlFor="hrepId" className="lsb-field__label">
                  HREP ID
                </label>
                <div className="lsb-field__control">
                  <User
                    size={18}
                    className="lsb-field__icon"
                    aria-hidden="true"
                  />
                  <input
                    id="hrepId"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="characters"
                    spellCheck={false}
                    required
                    autoFocus={autoFocus}
                    placeholder="HREP-2020-0001"
                    value={hrepId}
                    onChange={(e) => setHrepId(e.target.value)}
                    className="lsb-field__input"
                  />
                </div>
              </div>

              <div className="lsb-field">
                <label htmlFor="password" className="lsb-field__label">
                  Password
                </label>
                <div className="lsb-field__control">
                  <Lock
                    size={18}
                    className="lsb-field__icon"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="lsb-field__input lsb-field__input--has-action"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="lsb-field__action"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff size={18} aria-hidden="true" />
                    ) : (
                      <Eye size={18} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <label className="lsb-check" htmlFor="remember">
                <input type="checkbox" id="remember" />
                <span>Remember me</span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="lsb-login__submit"
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={18}
                      className="lsb-spin"
                      aria-hidden="true"
                    />
                    Signing in…
                  </>
                ) : (
                  "SIGN IN"
                )}
              </button>
            </form>

            <p className="lsb-login__notice">
              Authorized personnel only. Activity on this system may be logged.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
