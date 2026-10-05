import { Routes, Route } from "react-router-dom";
import { Layout } from "../layouts/Layout";
import { Home } from "../pages/Home";
import { AccessPass } from "../pages/AccessPass";
import { VehicleSticker } from "../pages/VehicleSticker";
import { Status } from "../pages/Status";
import { Admin } from "../pages/Admin.tsx";
import { AdminAccessPassPage } from "../modules/feat3-admin/pages/AdminAccessPassPage";
import { AdminVehicleStickerPage } from "../modules/feat3-admin/pages/AdminVehicleStickerPage";
import { AdminProfilesPage } from "../modules/feat3-admin/pages/AdminProfilesPage";
import { AdminLogsPage } from "../modules/feat3-admin/pages/AdminLogsPage";
import { AdminManualEntryPage } from "../modules/feat3-admin/pages/AdminManualEntryPage";
import { NotFound } from "../pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="access-pass" element={<AccessPass />} />
        <Route path="vehicle-sticker" element={<VehicleSticker />} />
        <Route path="status" element={<Status />} />
        <Route path="admin" element={<Admin />} />
        <Route path="admin/access-pass" element={<AdminAccessPassPage />} />
        <Route
          path="admin/vehicle-sticker"
          element={<AdminVehicleStickerPage />}
        />
        <Route path="admin/profiles" element={<AdminProfilesPage />} />
        <Route path="admin/logs" element={<AdminLogsPage />} />
        <Route path="admin/manual-entry" element={<AdminManualEntryPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
