import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../../providers/AuthProvider";
import { VehicleStickerTable } from "../components/vehicle-sticker/VehicleStickerTable";

export function AdminVehicleStickerPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        className="btn-outline-dark self-start"
        onClick={() => navigate("/admin")}
      >
        ← Back to Dashboard
      </button>
      <VehicleStickerTable />
    </div>
  );
}
