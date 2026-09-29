import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../../providers/AuthProvider";
import { AccessPassTable } from "../components/access-pass/AccessPassTable";

export function AdminAccessPassPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="relative left-1/2 flex min-h-[calc(100vh-14rem)] w-[min(100vw_-_2rem,80rem)] -translate-x-1/2 flex-col justify-center gap-6">
      <button
        type="button"
        className="btn-outline-dark self-end border!"
        onClick={() => navigate("/admin")}
      >
        Back to Admin Page
      </button>
      <AccessPassTable />
    </div>
  );
}
