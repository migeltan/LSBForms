import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { createPortal } from "react-dom";
import { CloseButton } from "../buttons/CloseButton";

export type SubmitResultStatus = "success" | "error" | null;

interface SubmitResultModalProps {
  /** null (or omitted) means the modal is closed / not rendered. */
  status: SubmitResultStatus;
  /** Optional override for the heading. Sensible defaults are used otherwise. */
  title?: string;
  /** Body message — e.g. a success confirmation or the specific error text. */
  message?: string;
  /** Shown on success, e.g. "AP-2026-00001", if you want to surface a reference number. */
  referenceId?: string;
  /** Label for the primary action button. Defaults to "Done" / "Try Again". */
  actionLabel?: string;
  onClose: () => void;
}

/**
 * Generic success/error modal for form submissions. Purely presentational —
 * each form owns its own `status` state and passes it in; this component
 * doesn't know anything about access passes, vehicles, or any specific form.
 *
 * Styled to match the SweetAlert-style ("swalfire") look used elsewhere in
 * the app — portal-rendered, pop-in animation, animated check / x icon.
 *
 * Usage:
 *   const [result, setResult] = useState<SubmitResultStatus>(null);
 *   ...
 *   <SubmitResultModal
 *     status={result}
 *     referenceId={applicationId}
 *     message={errorMessage}
 *     onClose={() => setResult(null)}
 *   />
 */
export function SubmitResultModal({
  status,
  title,
  message,
  referenceId,
  actionLabel,
  onClose,
}: SubmitResultModalProps) {
  const [copied, setCopied] = useState(false);
  useEffect(() => setCopied(false), [referenceId]);

  async function copyReference() {
    if (!referenceId) return;
    try {
      await navigator.clipboard.writeText(referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable (non-secure origin) — number stays selectable */
    }
  }

  // Close on Escape for keyboard accessibility.
  useEffect(() => {
    if (!status) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, onClose]);

  if (!status) return null;

  const isSuccess = status === "success";

  const resolvedTitle =
    title ?? (isSuccess ? "Submission Successful" : "Submission Failed");
  const resolvedMessage =
    message ??
    (isSuccess
      ? "Your application has been submitted successfully."
      : "Something went wrong while submitting your application. Please try again.");
  const resolvedActionLabel = actionLabel ?? (isSuccess ? "Done" : "Try Again");

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-result-title"
      onClick={onClose}
    >
      <style>{`
        @keyframes swal-pop {
          0% { transform: scale(0.7); opacity: 0; }
          45% { transform: scale(1.05); opacity: 1; }
          80% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes swal-draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      <div
        className="relative w-full max-w-md sm:max-w-lg rounded-2xl bg-white shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] px-6 sm:px-10 pt-10 sm:pt-12 pb-8 sm:pb-10 flex flex-col items-center"
        style={{
          animation: "swal-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton
          onClick={onClose}
          className="absolute right-3 top-3 border border-slate-200 sm:right-4 sm:top-4"
        />

        {/* Icon */}
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 mb-5 sm:mb-6 shrink-0">
          {isSuccess ? (
            <div
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, #ecfdf5 0%, #d1fae5 100%)",
                boxShadow: "0 0 0 4px #a7f3d0 inset",
              }}
            >
              <svg
                viewBox="0 0 52 52"
                className="h-11 w-11 sm:h-14 sm:w-14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M14 27l8 8 16-17"
                  stroke="#059669"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1,
                    animation: "swal-draw 0.5s ease 0.25s forwards",
                  }}
                />
              </svg>
            </div>
          ) : (
            <div
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, #fef2f2 0%, #fee2e2 100%)",
                boxShadow: "0 0 0 4px #fecaca inset",
              }}
            >
              <svg
                viewBox="0 0 52 52"
                className="h-11 w-11 sm:h-14 sm:w-14"
                fill="none"
                aria-hidden="true"
              >
                {["M17 17l18 18", "M35 17L17 35"].map((d, i) => (
                  <path
                    key={d}
                    d={d}
                    stroke="#dc2626"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    pathLength={1}
                    style={{
                      strokeDasharray: 1,
                      strokeDashoffset: 1,
                      animation: `swal-draw 0.3s ease ${0.25 + i * 0.2}s forwards`,
                    }}
                  />
                ))}
              </svg>
            </div>
          )}
        </div>

        {/* Text */}
        <h2
          id="submit-result-title"
          className="form-heading text-xl sm:text-2xl text-center"
        >
          {resolvedTitle}
        </h2>

        <p className="mt-2 text-sm sm:text-base text-gray-500 text-center">
          {resolvedMessage}
        </p>

        {isSuccess && referenceId && (
          <div className="mt-4 w-full">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="min-w-0">
                <p className="form-eyebrow text-xs">Reference Number</p>
                <p className="mt-0.5 font-mono text-base font-bold text-slate-900">
                  {referenceId}
                </p>
              </div>
              <button
                type="button"
                onClick={copyReference}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                {copied ? (
                  <Check size={14} className="text-emerald-600" />
                ) : (
                  <Copy size={14} />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">
              Keep this number. You'll need it to check your application status.
            </p>
          </div>
        )}

        {/* Button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-7 sm:mt-8 w-full rounded-lg px-5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-sm transition-colors"
          style={{
            background: isSuccess
              ? "linear-gradient(135deg, #34d399 0%, #059669 100%)"
              : "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
          }}
        >
          {resolvedActionLabel}
        </button>
      </div>
    </div>,
    document.body,
  );
}
