import { useCallback, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { api } from "../api/client";
import { BASE } from "./apiConfig";

// Keep in sync with PdfGeneratorService::BATCH_MAX on the backend.
export const BATCH_MAX = 30;

export type BatchSize = "access-pass" | "pvc-id";

// Error bodies arrive as Blobs (responseType: "blob"), so parse them manually.
async function readError(err: unknown): Promise<string> {
  if (!isAxiosError(err)) return "Could not download the IDs.";
  if (!err.response) return "Could not reach the server.";
  if (err.response.status === 401)
    return "Your session expired. Please log in again.";

  const data = err.response.data;
  if (data instanceof Blob) {
    try {
      const json = JSON.parse(await data.text());
      const list: string[] = Array.isArray(json.errors) ? json.errors : [];
      const more = list.length > 1 ? ` (+${list.length - 1} more)` : "";
      const msg = [json.message, list[0]].filter(Boolean).join(" ");
      if (msg) return msg + more;
    } catch {
      /* fall through */
    }
  }
  return "Could not download the IDs.";
}

export function useAccessPassBatchDownload() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const inFlight = useRef(false);

  const reset = useCallback(() => {
    setError(null);
    setNotice(null);
  }, []);

  const download = useCallback(
    async (applicantIds: number[], size: BatchSize) => {
      if (inFlight.current || applicantIds.length === 0) return;
      inFlight.current = true;
      setDownloading(true);
      setError(null);
      setNotice(null);

      try {
        const res = await api.post(
          `${BASE}/api/admin/access-pass/id/batch-download`,
          { applicant_ids: applicantIds, size },
          { responseType: "blob" },
        );

        const disposition = String(res.headers["content-disposition"] ?? "");
        const fileName =
          /filename="?([^";]+)"?/i.exec(disposition)?.[1] ??
          "AccessPassID-Batch.zip";

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
            ? `Downloaded ${added} of ${total} IDs. ${total - added} skipped or failed. See _errors.txt inside the ZIP.`
            : `Downloaded ${added} ID${added === 1 ? "" : "s"}.`,
        );
      } catch (e) {
        setError(await readError(e));
      } finally {
        setDownloading(false);
        inFlight.current = false;
      }
    },
    [],
  );

  return { downloading, error, notice, download, reset };
}
