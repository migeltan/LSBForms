import { useCallback, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { api } from "../api/client";
import { BASE } from "./apiConfig";

// Keep in sync with PdfGeneratorService::STICKER_BATCH_MAX on the backend.
export const STICKER_BATCH_MAX = 60;

export type SheetPaper = "a4" | "letter";
// compact = 12 per landscape page (scaled down); actual = real size, portrait
export type SheetLayout = "compact" | "actual";

async function readError(err: unknown): Promise<string> {
  if (!isAxiosError(err)) return "Could not generate the sticker sheet.";
  if (!err.response) return "Could not reach the server.";
  if (err.response.status === 401)
    return "Your session expired. Please log in again.";

  const data = err.response.data;
  if (data instanceof Blob) {
    try {
      const json = JSON.parse(await data.text());
      const list: string[] = Array.isArray(json.errors) ? json.errors : [];
      const msg = [json.message, list[0]].filter(Boolean).join(" ");
      if (msg) return msg;
    } catch {
      /* fall through */
    }
  }
  return "Could not generate the sticker sheet.";
}

export function useVehicleStickerBatchPrint() {
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const inFlight = useRef(false);

  const reset = useCallback(() => {
    setError(null);
    setNotice(null);
  }, []);

  const print = useCallback(
    async (applicantIds: number[], paper: SheetPaper, layout: SheetLayout) => {
      if (inFlight.current || applicantIds.length === 0) return;
      inFlight.current = true;
      setPrinting(true);
      setError(null);
      setNotice(null);

      try {
        const res = await api.post(
          `${BASE}/api/admin/vehicle-sticker/id/batch-print`,
          { applicant_ids: applicantIds, paper, layout },
          { responseType: "blob" },
        );

        const disposition = String(res.headers["content-disposition"] ?? "");
        const fileName =
          /filename=\"?([^\";]+)\"?/i.exec(disposition)?.[1] ??
          "VehicleStickerSheet.pdf";

        const objectUrl = window.URL.createObjectURL(res.data);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(objectUrl);

        const total =
          Number(res.headers["x-batch-total"]) || applicantIds.length;
        const added = Number(res.headers["x-batch-added"]) || total;
        setNotice(
          added < total
            ? `Sheet ready with ${added} of ${total} decals (${total - added} skipped). Print at 100% / Actual size.`
            : `Sheet ready with ${added} decal${added === 1 ? "" : "s"}. Print at 100% / Actual size.`,
        );
      } catch (e) {
        setError(await readError(e));
      } finally {
        setPrinting(false);
        inFlight.current = false;
      }
    },
    [],
  );

  return { printing, error, notice, print, reset };
}
