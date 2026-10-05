import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, SlidersHorizontal } from "lucide-react";
import { api } from "../../../../../api/client";
import type { ApplicantDetail } from "../../../../../hooks/types";
import { useAccessPassIdPdf } from "../../../../../hooks/useAccessPassIdPdf";
import {
  ApprovedDeclineModal,
  type ApprovedDeclineModalState,
} from "../../../../../components/modals/ApprovedDeclineModal";
import { ApplicantIdDownloadModal } from "../../../../../components/modals/ApplicantIdDownloadModal";
import { AccessPassLayoutEditor } from "./AccessPassLayoutEditor";
import { Skeleton } from "../../../../../components/ui/Skeleton";
// Keys match the backend (App\Support\AccessPassLayout::SIZES).
const SIZES = {
  "access-pass": { label: "Access Pass (74 × 105 mm)", w: 74, h: 105 },
  "pvc-id": { label: "PVC ID (54 × 85.6 mm)", w: 54, h: 85.6 },
} as const;
type SizeKey = keyof typeof SIZES;

// The preview HTML is laid out at the selected size's real mm dimensions (96 dpi).
const MM_TO_PX = 96 / 25.4;

type FlowState =
  | { step: "idle" }
  | { step: ApprovedDeclineModalState }
  | { step: "downloaded" };

export function IdPreviewPanel({
  detail,
  onApprove,
  onDecline,
  reviewing,
  reviewError,
}: {
  detail: ApplicantDetail;
  onApprove: () => Promise<void>;
  onDecline: () => Promise<void>;
  reviewing: boolean;
  reviewError: string | null;
}) {
  const [flow, setFlow] = useState<FlowState>({ step: "idle" });
  const prevReviewing = useRef(reviewing);

  const [sizeKey, setSizeKey] = useState<SizeKey>("access-pass");
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [side, setSide] = useState<"front" | "back">("front");
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
  const { previewUrl, previewBackUrl, downloadUrl, fileName } =
    useAccessPassIdPdf(applicantId, detail.profile.application_id);

  // Approve/decline result -> move the flow forward; refresh the preview after
  // a successful approve (the control number is assigned on approval).
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
      .get<string>(
        `${side === "back" ? previewBackUrl : previewUrl}?size=${sizeKey}&v=${previewVersion}`,
        {
          headers: { Accept: "text/html" },
          responseType: "text",
        },
      )
      .then((res) => !cancelled && setHtml(res.data))
      .catch(() => !cancelled && setPreviewError("Could not load the preview."))
      .finally(() => !cancelled && setLoadingPreview(false));
    return () => {
      cancelled = true;
    };
  }, [previewUrl, previewBackUrl, previewVersion, sizeKey, side]);

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

  // Measure the space available to the card so it can be fitted without scrolling.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setStage({ w: entry.contentRect.width, h: entry.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const size = SIZES[sizeKey];

  // Largest card that fits the stage while keeping the card's aspect ratio.
  const fitW =
    stage.w && stage.h ? Math.min(stage.w, (stage.h * size.w) / size.h) : 0;
  const fitH = fitW ? (fitW * size.h) / size.w : 0;

  const artW = size.w * MM_TO_PX;
  const artH = size.h * MM_TO_PX;
  const frameH = (frameW * size.h) / size.w;
  const scale = frameW ? Math.min(frameW / artW, frameH / artH) : 0;
  const offsetX = (frameW - artW * scale) / 2;
  const offsetY = (frameH - artH * scale) / 2;

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
        params: { size: sizeKey },
        headers: { Accept: "application/pdf" },
        responseType: "blob",
      });
      const objectUrl = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download =
        sizeKey === "pvc-id"
          ? fileName.replace("AccessPassID", "PvcID")
          : fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
      setFlow({ step: "downloaded" });
    } catch {
      setActionError("Could not download the ID.");
    } finally {
      setDownloading(false);
      downloadInFlight.current = false;
    }
  }

  return (
    <div className="flex min-h-[340px] w-full flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3">
        {/* Resize: pill reads "Resize"; a transparent native <select> on top handles the picker */}
        <div className="relative inline-flex w-fit items-center gap-2 rounded-md border border-gray-300 bg-gray-100 py-1.5 pl-3 pr-2 text-xs font-semibold text-gray-700 focus-within:ring-2 focus-within:ring-blue-300">
          <span>Resize</span>
          <span className="font-normal text-gray-500">
            · {sizeKey === "pvc-id" ? "PVC ID" : "Access Pass"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          <select
            value={sizeKey}
            onChange={(e) => setSizeKey(e.target.value as SizeKey)}
            aria-label="Resize preview"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          >
            {(Object.keys(SIZES) as SizeKey[]).map((k) => (
              <option key={k} value={k}>
                {SIZES[k].label}
              </option>
            ))}
          </select>
        </div>

        {/* Front / Back */}
        <div
          role="group"
          aria-label="Card side"
          className="inline-flex overflow-hidden rounded-md border border-gray-300 bg-gray-100 text-xs font-semibold"
        >
          {(["front", "back"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSide(s)}
              aria-pressed={side === s}
              className={`px-3 py-1.5 capitalize transition-colors ${
                side === s
                  ? "bg-[#15304f] text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stage: takes all the remaining height; the card is fitted inside it */}
      <div ref={stageRef} className="relative mt-4 min-h-[160px] flex-1">
        <div
          ref={frameRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-gray-800/70 bg-white"
          style={
            fitW
              ? { width: fitW, height: fitH }
              : { width: "100%", aspectRatio: `${size.w} / ${size.h}` }
          }
        >
          {loadingPreview && (
            <Skeleton className="absolute inset-0 rounded-none" />
          )}
          {!loadingPreview && previewError && (
            <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-[var(--smart-red,#c0392b)]">
              {previewError}
            </p>
          )}
          {!loadingPreview && html && scale > 0 && (
            <iframe
              title="ID preview"
              srcDoc={html}
              scrolling="no"
              className="pointer-events-none absolute left-0 top-0 border-0 bg-white"
              style={{
                width: artW,
                height: artH,
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
          label="Access Pass ID"
          onClose={closeEverything}
        />
      )}

      {layoutOpen && (
        <AccessPassLayoutEditor
          applicantId={applicantId}
          size={sizeKey}
          onClose={() => setLayoutOpen(false)}
          onSaved={() => setPreviewVersion((v) => v + 1)}
        />
      )}
    </div>
  );
}
