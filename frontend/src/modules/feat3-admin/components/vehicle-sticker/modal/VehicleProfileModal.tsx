import { useEffect, useRef, useState } from "react";
import type { VehicleApplicantDetail } from "../../../../../hooks/types";
import {
  ApprovedDeclineModal,
  type ApprovedDeclineModalState,
} from "../../../../../components/modals/ApprovedDeclineModal";
import { ApplicantIdPreviewModal } from "../../../../../components/modals/ApplicantIdPreviewModal";
import { ApplicantIdTestPreview } from "../../../../../components/modals/ApplicantIdTestPreview";
import { ApplicantIdDownloadModal } from "../../../../../components/modals/ApplicantIdDownloadModal";
import { useVehicleStickerIdPdf } from "../../../../../hooks/useVehicleStickerIdPdf";

const STATUS_STYLES: Record<string, string> = {
  Approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Rejected: "bg-red-50 text-red-700 ring-1 ring-red-200",
  "Under Review": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  "Incomplete/Returned": "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  Completed: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  Pending: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
};

function StatusBadgeLocal({ status }: { status: string | null | undefined }) {
  const label = status || "Pending";
  const style = STATUS_STYLES[label] ?? STATUS_STYLES.Pending;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${style}`}
    >
      {label}
    </span>
  );
}

function CarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-8 w-8 text-[var(--smart-navy,#1e3a5f)]/40"
    >
      <path
        d="M3 13l2-6a2 2 0 0 1 2-1.4h10a2 2 0 0 1 2 1.4l2 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 13h18v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="15.5" r="0.5" fill="currentColor" />
      <circle cx="16.5" cy="15.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M10 3.5c-4.5 0-7.5 4.5-7.5 6.5s3 6.5 7.5 6.5 7.5-4.5 7.5-6.5-3-6.5-7.5-6.5Zm0 10.5a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
      <path d="M10 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
    </svg>
  );
}

// "preview-id" is a standalone entry point into the test-preview modal —
// separate from the "preview" step that only fires after an approve.
type FlowState =
  | { step: "idle" }
  | { step: ApprovedDeclineModalState }
  | { step: "preview-id" }
  | { step: "preview" }
  | { step: "downloaded" };

export function VehicleProfileModal({
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
  const p = detail.personal_information;
  const [flow, setFlow] = useState<FlowState>({ step: "idle" });
  const prevReviewing = useRef(reviewing);

  useEffect(() => {
    if (prevReviewing.current && !reviewing) {
      if (flow.step === "approving") {
        setFlow(reviewError ? { step: "error" } : { step: "approved" });
      } else if (flow.step === "declining") {
        setFlow(reviewError ? { step: "error" } : { step: "declined" });
      }
    }
    prevReviewing.current = reviewing;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewing]);

  function handlePreviewIdClick() {
    setFlow({ step: "preview-id" });
  }

  function handleApproveClick() {
    setFlow({ step: "approving" });
    onApprove();
  }

  function handleDeclineClick() {
    setFlow({ step: "decline-confirm" });
  }

  function handleConfirmDecline() {
    setFlow({ step: "declining" });
    onDecline();
  }

  function closeEverything() {
    setFlow({ step: "idle" });
  }

  const applicantId = detail.profile.applicant_id;
  const { previewUrl, downloadUrl, fileName } = useVehicleStickerIdPdf(
    applicantId,
    detail.profile.application_id
  );

  const busy =
    reviewing || flow.step === "approving" || flow.step === "declining";

  return (
    <>
      <div className="flex flex-col gap-4 pb-5 border-b border-gray-200 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center min-w-0 gap-4">
          <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-[var(--smart-navy,#1e3a5f)]/5 flex items-center justify-center">
            <CarIcon />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[var(--smart-navy,#1e3a5f)] leading-tight truncate">
              {detail.profile.full_name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs font-medium text-gray-500">
                {detail.profile.application_id}
              </span>
              <span className="text-xs text-gray-300">&middot;</span>
              <span className="text-xs font-medium text-gray-500">
                {detail.vehicle_information.plate_number || "No plate on file"}
              </span>
              <span className="text-xs text-gray-300">&middot;</span>
              <StatusBadgeLocal status={p.status} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-1.5 sm:items-end shrink-0">
          <div className="flex gap-2">
            <button
              onClick={handlePreviewIdClick}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 shadow-sm transition-colors"
            >
              <EyeIcon />
              Preview ID
            </button>
            <button
              onClick={handleApproveClick}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 shadow-sm transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.79 6.8-6.79a1 1 0 0 1 1.4 0Z"
                  clipRule="evenodd"
                />
              </svg>
              Approve
            </button>
            <button
              onClick={handleDeclineClick}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--smart-red,#c0392b)] text-sm font-semibold px-4 py-2 ring-1 ring-inset ring-[var(--smart-red,#c0392b)]/30 transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path
                  fillRule="evenodd"
                  d="M10 8.59 6.7 5.29a1 1 0 0 0-1.41 1.42L8.59 10l-3.3 3.29a1 1 0 1 0 1.41 1.42L10 11.41l3.29 3.3a1 1 0 0 0 1.42-1.42L11.41 10l3.3-3.29a1 1 0 0 0-1.42-1.42L10 8.59Z"
                  clipRule="evenodd"
                />
              </svg>
              Decline
            </button>
          </div>
        </div>
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
          onContinueAfterApprove={() => setFlow({ step: "preview" })}
          onConfirmDecline={handleConfirmDecline}
          onDismissDeclineConfirm={closeEverything}
          onCloseDeclined={closeEverything}
          onCloseError={closeEverything}
        />
      )}

      {flow.step === "preview-id" && (
        <ApplicantIdTestPreview
          type="vehicle-sticker"
          downloadUrl={downloadUrl}
          fileName={fileName}
          onClose={closeEverything}
          onDownloaded={() => setFlow({ step: "downloaded" })}
        />
      )}

      {flow.step === "preview" && (
        <ApplicantIdPreviewModal
          type="vehicle-sticker"
          previewUrl={previewUrl}
          downloadUrl={downloadUrl}
          fileName={fileName}
          onClose={closeEverything}
          onDownloaded={() => setFlow({ step: "downloaded" })}
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
