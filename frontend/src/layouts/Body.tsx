import { Outlet } from "react-router-dom";

export function Body() {
  return (
    <>
      {/* Decorative faceted background shapes, echoing the SMART logo's
          angular geometry. Fixed + negative z-index so they sit as subtle
          texture behind every page. */}
      <div className="page-bg-decor" aria-hidden="true">
        <span className="bg-shape bg-shape-blue bg-shape-1" />
        <span className="bg-shape bg-shape-yellow bg-shape-2" />
        <span className="bg-shape bg-shape-red bg-shape-3" />
        <span className="bg-shape bg-shape-blue bg-shape-4" />
      </div>

      <main id="mainContent" className="max-w-6xl px-4 py-6 mx-auto">
        <Outlet />
      </main>
    </>
  );
}
