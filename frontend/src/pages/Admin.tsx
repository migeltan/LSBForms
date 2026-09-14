import { useAuth } from "../providers/AuthProvider";
import { AdminLogin } from "../modules/feat3-admin/pages/AdminLogin";
import { AdminPage } from "../modules/feat3-admin/pages/AdminPage";

export function Admin() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <AdminPage /> : <AdminLogin />;
}
