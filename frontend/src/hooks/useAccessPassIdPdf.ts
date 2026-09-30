// src/hooks/useAccessPassIdPdf.ts
import { BASE } from "./apiConfig";

export function useAccessPassIdPdf(
  applicantId: string | number,
  applicationId?: string | number | null,
) {
  const previewUrl = `${BASE}/api/admin/access-pass/${applicantId}/id/preview`;
  const previewBackUrl = `${BASE}/api/admin/access-pass/${applicantId}/id/preview-back`;
  const downloadUrl = `${BASE}/api/admin/access-pass/${applicantId}/id/download`;
  const fileName = `AccessPassID-${applicationId ?? applicantId}.pdf`;

  return { previewUrl, previewBackUrl, downloadUrl, fileName };
}
