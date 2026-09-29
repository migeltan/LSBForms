import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Body } from "./Body";
import { Footer } from "./Footer";
import { useAuth } from "../providers/AuthProvider";

/**
 * Root page shell: Header + Body (which renders the routed page via
 * <Outlet />) + Footer, stacked so the footer sticks to the bottom on
 * shobt pages. Mirrors the original PHP layout's html/body/main
 * structure — see src/styles/theme-smart.css section 2.
 *
 * Footer is suppressed only on the Admin login screen; it reappears
 * once the admin is authenticated, and every other route is unaffected.
 */
const ADMIN_TABLE_PATHS = ["/admin/access-pass", "/admin/vehicle-sticker"];

export function Layout() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const hideFooter = location.pathname === "/admin" && !isAuthenticated;

  const hideHeader = ADMIN_TABLE_PATHS.includes(
    location.pathname.replace(/\/$/, ""),
  );

  return (
    <div className="app-shell">
      {!hideHeader && <Header />}
      <Body />
      {!hideFooter && <Footer />}
    </div>
  );
}
