import { createPortal } from "react-dom";

/**
 * States shown by this modal:
 *
 *  - "approving"       -> spinner, "Approving application..."
 *  - "approved"         -> green check, "Application is Approved" (OK -> opens the ID preview modal)
 *  - "decline-confirm"  -> ORANGE warning, "Are you sure you want to decline this application?" (Yes / No)
 *  - "declining"        -> spinner, "Declining application..."
 *  - "declined"         -> red X, "Application is Declined" (OK -> closes everything, back to table)
 *  - "error"            -> red X, shows errorMessage
 *
 * Visual language matches the existing SaveCancelModal (SweetAlert-style
 * pop-in, soft tinted icon circle, pill buttons).
 */
export type ApprovedDeclineModalState =
  | "approving"
  | "approved"
  | "decline-confirm"
  | "declining"
  | "declined"
  | "error";

export function ApprovedDeclineModal({
  state,
  errorMessage,
  onContinueAfterApprove,
  onConfirmDecline,
  onDismissDeclineConfirm,
  onCloseDeclined,
  onCloseError,
}: {
  state: ApprovedDeclineModalState;
  /** Only used when state === "error" */
  errorMessage?: string | null;
  /** "OK" after "Application is Approved" -> parent opens the ID preview modal */
  onContinueAfterApprove?: () => void;
  /** "Yes" on the decline warning */
  onConfirmDecline?: () => void;
  /** "No" on the decline warning -> go back, keep everything as-is */
  onDismissDeclineConfirm?: () => void;
  /** "OK" after "Application is Declined" -> close modal, return to table */
  onCloseDeclined?: () => void;
  /** "OK" on a request error */
  onCloseError?: () => void;
}) {
  const isBusy = state === "approving" || state === "declining";
  const isConfirm = state === "decline-confirm";
  const isApproved = state === "approved";
  const isDeclined = state === "declined";
  const isError = state === "error";

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 sm:p-6">
      <style>{`
        @keyframes adm-pop {
          0% { transform: scale(0.7); opacity: 0; }
          45% { transform: scale(1.05); opacity: 1; }
          80% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes adm-check-line-tip {
          0% { width: 0; left: 1px; top: 19px; }
          54% { width: 0; left: 1px; top: 19px; }
          70% { width: 13px; left: 0px; top: 28px; }
          84% { width: 13px; left: 0px; top: 28px; }
          100% { width: 13px; left: 0px; top: 28px; }
        }
        @keyframes adm-check-line-long {
          0% { width: 0; right: 30px; top: 40px; }
          65% { width: 0; right: 30px; top: 40px; }
          84% { width: 40px; right: 0px; top: 22px; }
          100% { width: 40px; right: 0px; top: 22px; }
        }
        @keyframes adm-x-line-left {
          0% { width: 0; left: 8px; top: 28px; }
          65% { width: 0; left: 8px; top: 28px; }
          84% { width: 34px; left: 6px; top: 28px; }
          100% { width: 34px; left: 6px; top: 28px; }
        }
        @keyframes adm-x-line-right {
          0% { width: 0; right: 8px; top: 28px; }
          65% { width: 0; right: 8px; top: 28px; }
          84% { width: 34px; right: 6px; top: 28px; }
          100% { width: 34px; right: 6px; top: 28px; }
        }
        @keyframes adm-warn-pop {
          0% { transform: scale(0) rotate(-8deg); opacity: 0; }
          60% { transform: scale(1.08) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes adm-warn-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
        }
      `}</style>

      <div
        className="relative w-full max-w-md sm:max-w-lg rounded-2xl bg-white shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] px-6 sm:px-10 pt-10 sm:pt-12 pb-8 sm:pb-10 flex flex-col items-center"
        style={{ animation: "adm-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        {/* Icon */}
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 mb-5 sm:mb-6 shrink-0">
          {isBusy ? (
            <div
              className={`h-20 w-20 sm:h-24 sm:w-24 rounded-full border-[5px] sm:border-[6px] animate-spin ${
                state === "declining"
                  ? "border-orange-100 border-t-orange-500"
                  : "border-emerald-100 border-t-emerald-500"
              }`}
            />
          ) : isConfirm ? (
            <div
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, #fff7ed 0%, #ffedd5 100%)",
                boxShadow: "0 0 0 4px #fdba74 inset",
                animation: "adm-warn-pop 0.45s ease forwards",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-11 w-11 sm:h-12 sm:w-12"
                fill="none"
              >
                <path
                  d="M12 3.5 21.5 20h-19L12 3.5Z"
                  fill="#fdba74"
                  stroke="#ea580c"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <rect
                  x="11.15"
                  y="9.5"
                  width="1.7"
                  height="5.2"
                  rx="0.85"
                  fill="#ea580c"
                />
                <circle cx="12" cy="16.6" r="1" fill="#ea580c" />
              </svg>
            </div>
          ) : isApproved ? (
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
                    animation: "adm-check-line-tip 0.75s ease forwards",
                  }}
                />
                <span
                  className="absolute block h-[3px] sm:h-[4px] rounded-full bg-emerald-600"
                  style={{
                    animation: "adm-check-line-long 0.75s ease forwards",
                  }}
                />
              </div>
            </div>
          ) : (
            // "declined" and "error" both use the red X treatment
            <div
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, #fef2f2 0%, #fee2e2 100%)",
                boxShadow: "0 0 0 4px #fecaca inset",
                animation: isDeclined ? "adm-warn-shake 0.4s ease" : undefined,
              }}
            >
              <div className="relative h-9 w-9 sm:h-11 sm:w-11">
                <span
                  className="absolute block h-[3px] sm:h-[4px] rounded-full bg-red-600"
                  style={{ animation: "adm-x-line-left 0.6s ease forwards" }}
                />
                <span
                  className="absolute block h-[3px] sm:h-[4px] rounded-full bg-red-600"
                  style={{ animation: "adm-x-line-right 0.6s ease forwards" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Text */}
        {state === "approving" && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
              Approving application&hellip;
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500 text-center">
              Please wait a moment.
            </p>
          </>
        )}

        {isApproved && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
              Application is Approved
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500 text-center">
              The Access Pass ID is ready to preview.
            </p>
          </>
        )}

        {isConfirm && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
              Decline this application?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500 text-center">
              This will mark the application as{" "}
              <span className="font-semibold text-orange-600">Rejected</span>.
              You can&rsquo;t undo this from here.
            </p>
          </>
        )}

        {state === "declining" && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
              Declining application&hellip;
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500 text-center">
              Please wait a moment.
            </p>
          </>
        )}

        {isDeclined && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
              Application is Declined
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500 text-center">
              The applicant&rsquo;s status has been updated.
            </p>
          </>
        )}

        {isError && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500 text-center">
              {errorMessage ||
                "The request could not be completed. Please try again."}
            </p>
          </>
        )}

        {/* Buttons */}
        {isConfirm && (
          <div className="mt-7 sm:mt-8 flex w-full gap-3 sm:gap-4">
            <button
              onClick={onDismissDeclineConfirm}
              className="flex-1 rounded-lg px-5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              No
            </button>
            <button
              onClick={onConfirmDecline}
              className="flex-1 rounded-lg px-5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-sm transition-colors"
              style={{
                background: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
              }}
            >
              Yes, decline
            </button>
          </div>
        )}

        {isApproved && (
          <button
            onClick={onContinueAfterApprove}
            className="mt-7 sm:mt-8 w-full rounded-lg px-5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-sm transition-colors"
            style={{
              background: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
            }}
          >
            Preview ID
          </button>
        )}

        {isDeclined && (
          <button
            onClick={onCloseDeclined}
            className="mt-7 sm:mt-8 w-full rounded-lg px-5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-sm transition-colors"
            style={{
              background: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
            }}
          >
            OK
          </button>
        )}

        {isError && (
          <button
            onClick={onCloseError}
            className="mt-7 sm:mt-8 w-full rounded-lg px-5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-sm transition-colors"
            style={{
              background: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
            }}
          >
            OK
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
