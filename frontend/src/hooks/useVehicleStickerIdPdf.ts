// src/hooks/useVehicleStickerIdPdf.ts
import { BASE } from "./apiConfig";

export function useVehicleStickerIdPdf(
  applicantId: string | number,
  applicationId?: string | number | null
) {
  const previewUrl = `${BASE}/api/admin/vehicle-sticker/${applicantId}/id/preview`;
  const downloadUrl = `${BASE}/api/admin/vehicle-sticker/${applicantId}/id/download`;
  const fileName = `VehicleStickerID-${applicationId ?? applicantId}.pdf`;

  return { previewUrl, downloadUrl, fileName };
}
