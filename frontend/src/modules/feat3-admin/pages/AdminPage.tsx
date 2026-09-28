import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../providers/AuthProvider";

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
            <button type="button" className="btn btn-govt-outline btn-sm">
              Edit Info
            </button>
            <button
              type="button"
              className="btn btn-govt-primary btn-sm"
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
            <h3>Access Pass Application</h3>
            <div className="admin-app-panel-divider" />
            <div className="admin-app-panel-stats">
              <div>— Pending Applications</div>
              <div>— To review</div>
            </div>
          </div>
          <div className="admin-app-card">
            <div className="admin-app-card-footer">
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
            <h3>Vehicle Sticker Application</h3>
            <div className="admin-app-panel-divider" />
            <div className="admin-app-panel-stats">
              <div>— Pending Applications</div>
              <div>— To review</div>
            </div>
          </div>
          <div className="admin-app-card">
            <div className="admin-app-card-footer">
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
