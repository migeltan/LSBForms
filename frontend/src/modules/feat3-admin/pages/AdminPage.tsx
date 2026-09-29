import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TOKEN_KEY, useAuth } from "../../../providers/AuthProvider";
import { BASE } from "../../../hooks/apiConfig";
import type { ApplicationStatus } from "../../../hooks/types";

// "Pending" = not yet finalised. "To review" = freshly submitted (the badge
// label for "Submitted" is "For Review").
const PENDING: ApplicationStatus[] = [
  "Submitted",
  "Under Review",
  "Incomplete/Returned",
];
const TO_REVIEW: ApplicationStatus[] = ["Submitted"];

interface Counts {
  pending: number;
  toReview: number;
}

async function fetchCounts(path: string, signal: AbortSignal): Promise<Counts> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${BASE}/api/admin/${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal,
  });
  if (!res.ok) throw new Error("Request failed");
  const rows: { status: ApplicationStatus }[] = await res.json();
  return {
    pending: rows.filter((r) => PENDING.includes(r.status)).length,
    toReview: rows.filter((r) => TO_REVIEW.includes(r.status)).length,
  };
}

function useCounts(path: string) {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchCounts(path, ctrl.signal)
      .then(setCounts)
      .catch(() => {
        if (!ctrl.signal.aborted) setFailed(true);
      });
    return () => ctrl.abort();
  }, [path]);

  return { counts, failed };
}

function AppStats({
  counts,
  failed,
}: {
  counts: Counts | null;
  failed: boolean;
}) {
  const show = (n?: number) => (failed ? "–" : n === undefined ? "…" : n);
  return (
    <ul className="admin-app-stats">
      <li>
        <span className="admin-app-stat-dot admin-app-stat-dot--blue" />
        {show(counts?.pending)} Pending Applications
      </li>
      <li>
        <span className="admin-app-stat-dot admin-app-stat-dot--green" />
        {show(counts?.toReview)} To review
      </li>
    </ul>
  );
}

function initialsOf(name?: string) {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "A";
}

export function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const access = useCounts("access-pass");
  const vehicle = useCounts("vehicle-sticker");

  return (
    <div className="flex flex-col gap-6">
      {/* -----------------------------------------------------------
       * Welcome card
       * --------------------------------------------------------- */}
      <div className="form-section-card admin-welcome-card">
        <div className="admin-welcome-main">
          <div className="section-label admin-welcome-label">Admin</div>
          <h2 className="admin-welcome-heading">
            Welcome, {user?.full_name ?? "Administrator"}
          </h2>
          <p className="admin-welcome-body max-w-prose">
            Review, approve, or decline applications. Auto-template the Access
            Pass and Vehicle Sticker applications under the panels below.
          </p>
        </div>

        <div className="admin-welcome-side">
          <div className="admin-avatar" aria-hidden="true">
            {initialsOf(user?.full_name)}
          </div>
          <div className="admin-welcome-name">{user?.full_name ?? "Admin"}</div>
          <div className="admin-welcome-actions">
            <button type="button" className="btn-outline-dark">
              Edit Info
            </button>
            <button
              type="button"
              className="btn btn-govt-info"
              onClick={logout}
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* -----------------------------------------------------------
       * Application category panels — "View Table" now navigates to
       * a dedicated page rather than expanding in place.
       * --------------------------------------------------------- */}
      <div className="admin-panel-grid">
        <div className="admin-app-card-wrap">
          <div className="admin-app-panel admin-app-panel--red">
            <h3>
              Access Pass
              <br />
              Application
            </h3>
            <div className="admin-app-panel-divider" />
            <p className="admin-app-panel-desc">
              Review and approve visitor access pass requests.
            </p>
          </div>
          <div className="admin-app-card">
            <div className="admin-app-card-footer">
              <AppStats {...access} />
              <button
                type="button"
                className="btn-outline-dark"
                onClick={() => navigate("/admin/access-pass")}
              >
                View Table
              </button>
            </div>
          </div>
        </div>

        <div className="admin-app-card-wrap">
          <div className="admin-app-panel admin-app-panel--yellow">
            <h3>
              Vehicle Sticker
              <br />
              Application
            </h3>
            <div className="admin-app-panel-divider" />
            <p className="admin-app-panel-desc">
              Review and approve vehicle sticker requests.
            </p>
          </div>
          <div className="admin-app-card">
            <div className="admin-app-card-footer">
              <AppStats {...vehicle} />
              <button
                type="button"
                className="btn-outline-dark"
                onClick={() => navigate("/admin/vehicle-sticker")}
              >
                View Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* -----------------------------------------------------------
       * Future feature teasers — same floating-banner treatment,
       * inert for now
       * --------------------------------------------------------- */}
      <div className="admin-feature-grid">
        <div className="admin-feature-card-wrap">
          <div className="admin-feature-card-inner admin-feature-card-inner--blue">
            Auto
            <br />
            Template
          </div>
          <div className="admin-feature-card">
            <span className="admin-feature-badge">Coming soon</span>
          </div>
        </div>
        <div className="admin-feature-card-wrap">
          <div className="admin-feature-card-inner admin-feature-card-inner--magenta">
            Add
            <br />
            Admin Profile
          </div>
          <div className="admin-feature-card">
            <span className="admin-feature-badge">Coming soon</span>
          </div>
        </div>
        <div className="admin-feature-card-wrap">
          <div className="admin-feature-card-inner admin-feature-card-inner--green">
            Activity
            <br />
            Log
          </div>
          <div className="admin-feature-card">
            <span className="admin-feature-badge">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
