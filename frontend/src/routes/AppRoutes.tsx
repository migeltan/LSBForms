import { Routes, Route } from "react-router-dom";
import { Layout } from "../layouts/Layout";
import { Home } from "../pages/Home";
import { AccessPass } from "../pages/AccessPass";
import { VehicleSticker } from "../pages/VehicleSticker";
import { Status } from "../pages/Status";
import { Admin } from "../pages/Admin.tsx";
import { NotFound } from "../pages/NotFound";
import { StatusSearch } from "../modules/feat4-check-status/InputSearch/StatusSearch.tsx";
import { StatusQrScan } from "../modules/feat4-check-status/QrSearch/StatusQrScan.tsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="access-pass" element={<AccessPass />} />
        <Route path="vehicle-sticker" element={<VehicleSticker />} />
        <Route path="status" element={<Status />} />
        <Route path="status/search" element={<StatusSearch />} />
        <Route path="status/qr" element={<StatusQrScan />} />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
