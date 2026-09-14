import { useEffect } from "react";
import { createPortal } from "react-dom";

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
        @keyframes swal-check-line-tip {
          0% { width: 0; left: 1px; top: 19px; }
          54% { width: 0; left: 1px; top: 19px; }
          70% { width: 13px; left: 0px; top: 28px; }
          84% { width: 13px; left: 0px; top: 28px; }
          100% { width: 13px; left: 0px; top: 28px; }
        }
        @keyframes swal-check-line-long {
          0% { width: 0; right: 30px; top: 40px; }
          65% { width: 0; right: 30px; top: 40px; }
          84% { width: 40px; right: 0px; top: 22px; }
          100% { width: 40px; right: 0px; top: 22px; }
        }
        @keyframes swal-x-line-left {
          0% { width: 0; left: 8px; top: 28px; }
          65% { width: 0; left: 8px; top: 28px; }
          84% { width: 34px; left: 6px; top: 28px; }
          100% { width: 34px; left: 6px; top: 28px; }
        }
        @keyframes swal-x-line-right {
          0% { width: 0; right: 8px; top: 28px; }
          65% { width: 0; right: 8px; top: 28px; }
          84% { width: 34px; right: 6px; top: 28px; }
          100% { width: 34px; right: 6px; top: 28px; }
        }
      `}</style>

      <div
        className="relative w-full max-w-md sm:max-w-lg rounded-2xl bg-white shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] px-6 sm:px-10 pt-10 sm:pt-12 pb-8 sm:pb-10 flex flex-col items-center"
        style={{
          animation: "swal-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
              <div className="relative h-9 w-9 sm:h-11 sm:w-11">
                <span
                  className="absolute block h-[3px] sm:h-[4px] rounded-full bg-emerald-600"
                  style={{
                    animation: "swal-check-line-tip 0.75s ease forwards",
                  }}
                />
                <span
                  className="absolute block h-[3px] sm:h-[4px] rounded-full bg-emerald-600"
                  style={{
                    animation: "swal-check-line-long 0.75s ease forwards",
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, #fef2f2 0%, #fee2e2 100%)",
                boxShadow: "0 0 0 4px #fecaca inset",
              }}
            >
              <div className="relative h-9 w-9 sm:h-11 sm:w-11">
                <span
                  className="absolute block h-[3px] sm:h-[4px] rounded-full bg-red-600"
                  style={{
                    animation: "swal-x-line-left 0.6s ease forwards",
                  }}
                />
                <span
                  className="absolute block h-[3px] sm:h-[4px] rounded-full bg-red-600"
                  style={{
                    animation: "swal-x-line-right 0.6s ease forwards",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Text */}
        <h2
          id="submit-result-title"
          className="text-xl sm:text-2xl font-bold text-gray-800 text-center"
        >
          {resolvedTitle}
        </h2>

        <p className="mt-2 text-sm sm:text-base text-gray-500 text-center">
          {resolvedMessage}
        </p>

        {isSuccess && referenceId && (
          <div className="mt-4 w-full rounded-lg bg-slate-50 px-4 py-2.5 text-center">
            <p className="text-xs font-medium text-slate-500">
              Reference Number
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">
              {referenceId}
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
    document.body
  );
}
