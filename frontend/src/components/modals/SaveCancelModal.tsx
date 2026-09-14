import { createPortal } from "react-dom";

type SaveCancelModalType =
  | "saving"
  | "success"
  | "cancelled"
  | "confirm-cancel";

export function SaveCancelModal({
  type,
  onDone,
  onConfirmCancel,
  onDismissConfirm,
}: {
  type: SaveCancelModalType;
  onDone: () => void;
  // Only used when type === "confirm-cancel"
  onConfirmCancel?: () => void;
  onDismissConfirm?: () => void;
}) {
  const isSaving = type === "saving";
  const isSuccess = type === "success";
  const isConfirm = type === "confirm-cancel";

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 sm:p-6">
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
        @keyframes swal-question-pop {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div
        className="relative w-full max-w-md sm:max-w-lg rounded-2xl bg-white shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] px-6 sm:px-10 pt-10 sm:pt-12 pb-8 sm:pb-10 flex flex-col items-center"
        style={{
          animation: "swal-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Icon */}
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 mb-5 sm:mb-6 shrink-0">
          {isSaving ? (
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-[5px] sm:border-[6px] border-emerald-100 border-t-emerald-500 animate-spin" />
          ) : isConfirm ? (
            <div
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, #fff7ed 0%, #ffedd5 100%)",
                boxShadow: "0 0 0 4px #fed7aa inset",
                animation: "swal-question-pop 0.4s ease forwards",
              }}
            >
              <span className="text-4xl sm:text-5xl font-bold text-orange-500 select-none leading-none">
                ?
              </span>
            </div>
          ) : isSuccess ? (
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
        {isSaving ? (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
              Saving changes&hellip;
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500 text-center">
              Please wait a moment.
            </p>
          </>
        ) : isConfirm ? (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
              Are you sure you want to cancel?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500 text-center">
              Any unsaved changes will be discarded.
            </p>
          </>
        ) : isSuccess ? (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
              Changes Saved!
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500 text-center">
              Your changes have been saved successfully.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
              Changes Cancelled
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500 text-center">
              Your edits were discarded.
            </p>
          </>
        )}

        {/* Buttons */}
        {isConfirm ? (
          <div className="mt-7 sm:mt-8 flex w-full gap-3 sm:gap-4">
            <button
              onClick={onDismissConfirm}
              className="flex-1 rounded-lg px-5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              No
            </button>
            <button
              onClick={onConfirmCancel}
              className="flex-1 rounded-lg px-5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-sm transition-colors"
              style={{
                background: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
              }}
            >
              Yes
            </button>
          </div>
        ) : (
          !isSaving && (
            <button
              onClick={onDone}
              className="mt-7 sm:mt-8 w-full rounded-lg px-5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-sm transition-colors"
              style={{
                background: isSuccess
                  ? "linear-gradient(135deg, #34d399 0%, #059669 100%)"
                  : "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
              }}
            >
              OK
            </button>
          )
        )}
      </div>
    </div>,
    document.body
  );
}
