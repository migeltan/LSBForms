import { Header } from "./Header";
import { Body } from "./Body";
import { Footer } from "./Footer";

/**
 * Root page shell: Header + Body (which renders the routed page via
 * <Outlet />) + Footer, stacked so the footer sticks to the bottom on
 * shobt pages. Mirrors the original PHP layout's html/body/main
 * structure — see src/styles/theme-smart.css section 2.
 */
export function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <Body />
      <Footer />
    </div>
  );
}
