import { createPortal } from "react-dom";

export function ApplicantIdDownloadModal({
  label = "ID", // Generic fallback — this modal is shared by every ID/sticker
  // type (Access Pass, Vehicle Sticker, and any future type). Callers
  // should always pass their own label ("Access Pass ID",
  // "Vehicle Sticker ID", etc.); this default only covers a caller that
  // forgets to, so it deliberately no longer defaults to "Access Pass ID".
  onClose,
}: {
  label?: string;
  onClose: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 sm:p-6">
      {/* ...keyframes unchanged... */}
      <style>{`
        @keyframes aidm-pop {
          0% { transform: scale(0.7); opacity: 0; }
          45% { transform: scale(1.05); opacity: 1; }
          80% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes aidm-check-line-tip {
          0% { width: 0; left: 1px; top: 19px; }
          54% { width: 0; left: 1px; top: 19px; }
          70% { width: 13px; left: 0px; top: 28px; }
          84% { width: 13px; left: 0px; top: 28px; }
          100% { width: 13px; left: 0px; top: 28px; }
        }
        @keyframes aidm-check-line-long {
          0% { width: 0; right: 30px; top: 40px; }
          65% { width: 0; right: 30px; top: 40px; }
          84% { width: 40px; right: 0px; top: 22px; }
          100% { width: 40px; right: 0px; top: 22px; }
        }
        @keyframes aidm-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      <div
        className="relative w-full max-w-md sm:max-w-lg rounded-2xl bg-white shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] px-6 sm:px-10 pt-10 sm:pt-12 pb-8 sm:pb-10 flex flex-col items-center"
        style={{
          animation: "aidm-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div className="relative w-20 h-20 mb-5 sm:h-24 sm:w-24 sm:mb-6 shrink-0">
          <div
            className="flex items-center justify-center w-20 h-20 rounded-full sm:h-24 sm:w-24"
            style={{
              background: "radial-gradient(circle, #ecfdf5 0%, #d1fae5 100%)",
              boxShadow: "0 0 0 4px #a7f3d0 inset",
            }}
          >
            <div className="relative h-9 w-9 sm:h-11 sm:w-11">
              <span
                className="absolute block h-[3px] sm:h-[4px] rounded-full bg-emerald-600"
                style={{ animation: "aidm-check-line-tip 0.75s ease forwards" }}
              />
              <span
                className="absolute block h-[3px] sm:h-[4px] rounded-full bg-emerald-600"
                style={{
                  animation: "aidm-check-line-long 0.75s ease forwards",
                }}
              />
            </div>
          </div>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="absolute -bottom-1 -right-1 h-7 w-7 sm:h-8 sm:w-8 text-emerald-600"
            style={{ animation: "aidm-bounce 1.4s ease-in-out infinite" }}
          >
            <path d="M12 3a1 1 0 0 1 1 1v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42l2.3 2.3V4a1 1 0 0 1 1-1Z" />
            <path d="M5 16a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-center text-gray-800 sm:text-2xl">
          {label} Downloaded Successfully
        </h2>
        <p className="mt-2 text-sm text-center text-gray-500 sm:text-base">
          The {label} has been saved to your device.
        </p>

        <button
          onClick={onClose}
          className="mt-7 sm:mt-8 w-full rounded-lg px-5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-sm transition-colors"
          style={{
            background: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
          }}
        >
          OK
        </button>
      </div>
    </div>,
    document.body
  );
}
