import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../providers/AuthProvider";
import { EditAdminInfoModal } from "../components/EditAdminInfoModal";
import { AdminDashboard } from "../components/dashboard/AdminDashboard";

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
  const [editOpen, setEditOpen] = useState(false);

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
            {user?.photo_url ? (
              <img src={user.photo_url} alt="" />
            ) : (
              initialsOf(user?.full_name)
            )}
          </div>
          <div className="admin-welcome-name">{user?.full_name ?? "Admin"}</div>
          <div className="admin-welcome-actions">
            <button
              type="button"
              className="btn-outline-dark"
              onClick={() => setEditOpen(true)}
            >
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
       * Dashboard — application panels with status breakdown, trends
       * --------------------------------------------------------- */}
      <AdminDashboard />

      {/* -----------------------------------------------------------
       * Future feature teasers — same floating-banner treatment,
       * inert for now
       * --------------------------------------------------------- */}
      <div className="admin-feature-grid">
        <div className="admin-app-card-wrap">
          <div className="admin-app-panel admin-app-panel--blue">
            <h3>
              Auto
              <br />
              Template
            </h3>
            <div className="admin-app-panel-divider" />
            <p className="admin-app-panel-desc">
              Encode paper-based applications and auto-generate the pass or
              sticker.
            </p>
          </div>
          <div className="admin-app-card">
            <div className="admin-app-card-footer admin-app-card-footer--end">
              <button
                type="button"
                className="btn-outline-dark"
                onClick={() => navigate("/admin/manual-entry")}
              >
                Open
              </button>
            </div>
          </div>
        </div>

        <div className="admin-app-card-wrap">
          <div className="admin-app-panel admin-app-panel--magenta">
            <h3>
              Add
              <br />
              Admin Profile
            </h3>
            <div className="admin-app-panel-divider" />
            <p className="admin-app-panel-desc">
              Create admin and reviewer accounts with contact details.
            </p>
          </div>
          <div className="admin-app-card">
            <div className="admin-app-card-footer admin-app-card-footer--end">
              <button
                type="button"
                className="btn-outline-dark"
                onClick={() => navigate("/admin/profiles")}
              >
                Open
              </button>
            </div>
          </div>
        </div>

        <div className="admin-app-card-wrap">
          <div className="admin-app-panel admin-app-panel--green">
            <h3>
              Activity
              <br />
              Log
            </h3>
            <div className="admin-app-panel-divider" />
            <p className="admin-app-panel-desc">
              Track approvals, declines and deletions made by admins.
            </p>
          </div>
          <div className="admin-app-card">
            <div className="admin-app-card-footer admin-app-card-footer--end">
              <button
                type="button"
                className="btn-outline-dark"
                onClick={() => navigate("/admin/logs")}
              >
                Open
              </button>
            </div>
          </div>
        </div>
      </div>
      {editOpen && <EditAdminInfoModal onClose={() => setEditOpen(false)} />}
    </div>
  );
}
