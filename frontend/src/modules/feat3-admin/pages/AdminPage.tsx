import { useAuth } from "../../../providers/AuthProvider";
import { AccessPassTable } from "../components/access-pass/AccessPassTable";
import { VehicleStickerTable } from "../components/vehicle-sticker/VehicleStickerTable";

export function AdminPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div className="form-section-card corner-accent-blue">
        <div className="section-label">Admin</div>
        <h2>Welcome, {user?.full_name}</h2>
        <p className="text-[var(--smart-muted)]">
          The review queue, applicant list, and clearance-branch tools go here.
        </p>
        <button className="btn btn-govt-outline btn-sm" onClick={logout}>
          Log out
        </button>
      </div>

      <AccessPassTable />
      <VehicleStickerTable />
    </div>
  );
}
