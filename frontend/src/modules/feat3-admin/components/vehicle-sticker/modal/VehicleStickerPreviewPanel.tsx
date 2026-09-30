import { useEffect, useRef, useState } from "react";
import { Download, SlidersHorizontal } from "lucide-react";
import { api } from "../../../../../api/client";
import type { VehicleApplicantDetail } from "../../../../../hooks/types";
import { useVehicleStickerIdPdf } from "../../../../../hooks/useVehicleStickerIdPdf";
import {
  ApprovedDeclineModal,
  type ApprovedDeclineModalState,
} from "../../../../../components/modals/ApprovedDeclineModal";
import { ApplicantIdDownloadModal } from "../../../../../components/modals/ApplicantIdDownloadModal";
import { AccessPassLayoutEditor } from "../../access-pass/modal/AccessPassLayoutEditor";

// Decal is a single fixed size: 3 x 5 in (76.2 x 127 mm). The preview HTML is
// laid out at real mm dimensions (96 dpi), same as the Access Pass preview.
const MM_TO_PX = 96 / 25.4;
const ART_W = 76.2 * MM_TO_PX; // 288
const ART_H = 127 * MM_TO_PX; // 480

// The decal is shown smaller than the column (the column itself is unchanged).
const SHRINK = 0.8;

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

  const [layoutOpen, setLayoutOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);

  const [html, setHtml] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const downloadInFlight = useRef(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const [frameW, setFrameW] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ w: 0, h: 0 });

  const applicantId = detail.profile.applicant_id;
  const { previewUrl, downloadUrl, fileName } = useVehicleStickerIdPdf(
    applicantId,
    detail.profile.application_id,
  );

  // Approve/decline result -> move the flow forward; refresh the preview after
  // a successful approve (the sticker number is assigned on approval).
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

  // Measure the space available to the decal so it can be fitted without scrolling.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setStage({ w: entry.contentRect.width, h: entry.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Largest decal that fits the stage (kept at the decal's aspect ratio), then shrunk.
  const fitW =
    stage.w && stage.h
      ? Math.min(stage.w, (stage.h * ART_W) / ART_H) * SHRINK
      : 0;
  const fitH = fitW ? (fitW * ART_H) / ART_W : 0;

  const frameH = (frameW * ART_H) / ART_W;
  const scale = frameW ? Math.min(frameW / ART_W, frameH / ART_H) : 0;
  const offsetX = (frameW - ART_W * scale) / 2;
  const offsetY = (frameH - ART_H * scale) / 2;

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
      setActionError("Could not download the decal.");
    } finally {
      setDownloading(false);
      downloadInFlight.current = false;
    }
  }

  return (
    <div className="flex min-h-[340px] w-full flex-1 flex-col">
      {/* Stage: takes all the remaining height; the decal is fitted inside it */}
      <div ref={stageRef} className="relative min-h-[160px] flex-1">
        <div
          ref={frameRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-gray-800/70 bg-white"
          style={
            fitW
              ? { width: fitW, height: fitH }
              : { width: "60%", aspectRatio: `${ART_W} / ${ART_H}` }
          }
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
              title="Decal preview"
              srcDoc={html}
              scrolling="no"
              className="pointer-events-none absolute left-0 top-0 border-0 bg-white"
              style={{
                width: ART_W,
                height: ART_H,
                transformOrigin: "top left",
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
              }}
            />
          )}
        </div>
      </div>

      {/* Download + Adjust Layout */}
      <div className="mt-4 flex shrink-0 flex-wrap justify-center gap-2">
        <button
          onClick={handleDownload}
          disabled={downloading || loadingPreview}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#15304f] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0f2744] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          {downloading ? "Downloading…" : "Download"}
        </button>
        <button
          onClick={() => setLayoutOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#15304f]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#15304f] transition-colors hover:bg-gray-50"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Adjust Layout
        </button>
      </div>
      {actionError && (
        <p className="mt-2 shrink-0 text-center text-xs text-[var(--smart-red,#c0392b)]">
          {actionError}
        </p>
      )}

      {/* Approve / Decline: fixed footer */}
      <div className="mt-3 flex shrink-0 justify-end gap-3 border-t border-gray-300 pt-5">
        <button
          onClick={() => {
            setFlow({ step: "approving" });
            onApprove();
          }}
          disabled={busy}
          className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => setFlow({ step: "decline-confirm" })}
          disabled={busy}
          className="rounded-lg border border-red-200 bg-white px-6 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
          label="Vehicle Decal"
          onClose={closeEverything}
        />
      )}

      {layoutOpen && (
        <AccessPassLayoutEditor
          kind="vehicle-sticker"
          applicantId={applicantId}
          onClose={() => setLayoutOpen(false)}
          onSaved={() => setPreviewVersion((v) => v + 1)}
        />
      )}
    </div>
  );
}
