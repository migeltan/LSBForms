import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { api } from "../../../../../api/client";
import type { VehicleApplicantDetail } from "../../../../../hooks/types";
import { useVehicleStickerIdPdf } from "../../../../../hooks/useVehicleStickerIdPdf";
import {
  ApprovedDeclineModal,
  type ApprovedDeclineModalState,
} from "../../../../../components/modals/ApprovedDeclineModal";
import { ApplicantIdDownloadModal } from "../../../../../components/modals/ApplicantIdDownloadModal";

// The sticker preview route is laid out at 288 x 384 px (3 x 4 in @ 96 dpi).
// Must match STICKER_WIDTH_PX / STICKER_HEIGHT_PX in PdfGeneratorService.
const ART_W = 288;
const ART_H = 480;

const SERIF = { fontFamily: '"Source Serif 4", Georgia, serif' } as const;

type FlowState =
  | { step: "idle" }
  | { step: ApprovedDeclineModalState }
  | { step: "downloaded" };

export function VehicleStickerPreviewPanel({
  detail,
  onApprove,
  onDecline,
  reviewing,
  reviewError,
}: {
  detail: VehicleApplicantDetail;
  onApprove: () => Promise<void>;
  onDecline: () => Promise<void>;
  reviewing: boolean;
  reviewError: string | null;
}) {
  const [flow, setFlow] = useState<FlowState>({ step: "idle" });
  const prevReviewing = useRef(reviewing);
  const [previewVersion, setPreviewVersion] = useState(0);

  const [html, setHtml] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const downloadInFlight = useRef(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const [frameW, setFrameW] = useState(0);

  const applicantId = detail.profile.applicant_id;
  const { previewUrl, downloadUrl, fileName } = useVehicleStickerIdPdf(
    applicantId,
    detail.profile.application_id,
  );

  // Approve/decline result -> move the flow forward; refresh the preview after
  // a successful approve.
  useEffect(() => {
    if (prevReviewing.current && !reviewing) {
      if (flow.step === "approving") {
        if (reviewError) {
          setFlow({ step: "error" });
        } else {
          setFlow({ step: "approved" });
          setPreviewVersion((v) => v + 1);
        }
      } else if (flow.step === "declining") {
        setFlow(reviewError ? { step: "error" } : { step: "declined" });
      }
    }
    prevReviewing.current = reviewing;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewing]);

  // Live preview: same auth'd HTML route the old preview modal used.
  useEffect(() => {
    let cancelled = false;
    setLoadingPreview(true);
    setPreviewError(null);
    api
      .get<string>(`${previewUrl}?v=${previewVersion}`, {
        headers: { Accept: "text/html" },
        responseType: "text",
      })
      .then((res) => !cancelled && setHtml(res.data))
      .catch(() => !cancelled && setPreviewError("Could not load the preview."))
      .finally(() => !cancelled && setLoadingPreview(false));
    return () => {
      cancelled = true;
    };
  }, [previewUrl, previewVersion]);

  // Track the frame width so the fixed-size artwork can be scaled to fit.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setFrameW(entry.contentRect.width),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = frameW ? frameW / ART_W : 0;

  const busy =
    reviewing || flow.step === "approving" || flow.step === "declining";

  function closeEverything() {
    setFlow({ step: "idle" });
  }

  async function handleDownload() {
    if (downloadInFlight.current) return;
    downloadInFlight.current = true;
    setActionError(null);
    setDownloading(true);
    try {
      const res = await api.get(downloadUrl, {
        headers: { Accept: "application/pdf" },
        responseType: "blob",
      });
      const objectUrl = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
      setFlow({ step: "downloaded" });
    } catch {
      setActionError("Could not download the sticker.");
    } finally {
      setDownloading(false);
      downloadInFlight.current = false;
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h3
          className="text-[26px] font-bold uppercase leading-none text-[#1f3a6b]"
          style={SERIF}
        >
          Preview
        </h3>
      </div>

      {/* Live sticker preview */}
      <div
        ref={frameRef}
        className="relative mt-4 w-full overflow-hidden rounded-2xl border border-gray-800/70 bg-white"
        style={{ aspectRatio: `${ART_W} / ${ART_H}` }}
      >
        {loadingPreview && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            Loading preview…
          </p>
        )}
        {!loadingPreview && previewError && (
          <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-[var(--smart-red,#c0392b)]">
            {previewError}
          </p>
        )}
        {!loadingPreview && html && scale > 0 && (
          <iframe
            title="Sticker preview"
            srcDoc={html}
            scrolling="no"
            className="pointer-events-none absolute left-0 top-0 border-0 bg-white"
            style={{
              width: ART_W,
              height: ART_H,
              transformOrigin: "top left",
              transform: `scale(${scale})`,
            }}
          />
        )}
      </div>

      {/* Download */}
      <div className="mt-4">
        <button
          onClick={handleDownload}
          disabled={downloading || loadingPreview}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#15304f] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f2744] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {downloading ? "Downloading…" : "Download"}
        </button>
      </div>
      {actionError && (
        <p className="mt-2 text-xs text-[var(--smart-red,#c0392b)]">
          {actionError}
        </p>
      )}

      {/* Approve / Decline */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setFlow({ step: "approving" });
            onApprove();
          }}
          disabled={busy}
          className="rounded-lg bg-emerald-600 px-3 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => setFlow({ step: "decline-confirm" })}
          disabled={busy}
          className="rounded-lg border border-red-200 bg-white px-3 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Decline
        </button>
      </div>

      {(flow.step === "approving" ||
        flow.step === "approved" ||
        flow.step === "decline-confirm" ||
        flow.step === "declining" ||
        flow.step === "declined" ||
        flow.step === "error") && (
        <ApprovedDeclineModal
          state={flow.step}
          errorMessage={reviewError}
          onContinueAfterApprove={closeEverything}
          onConfirmDecline={() => {
            setFlow({ step: "declining" });
            onDecline();
          }}
          onDismissDeclineConfirm={closeEverything}
          onCloseDeclined={closeEverything}
          onCloseError={closeEverything}
        />
      )}

      {flow.step === "downloaded" && (
        <ApplicantIdDownloadModal
          label="Vehicle Sticker ID"
          onClose={closeEverything}
        />
      )}
    </>
  );
}
