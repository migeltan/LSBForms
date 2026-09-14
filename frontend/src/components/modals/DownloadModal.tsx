import { createPortal } from "react-dom";

export type DownloadModalStatus = "downloading" | "success" | "error";

export function DownloadModal({
  status,
  fileName,
  onDone,
}: {
  status: DownloadModalStatus;
  fileName?: string;
  onDone: () => void;
}) {
  const isDownloading = status === "downloading";
  const isSuccess = status === "success";

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 sm:p-6">
      <style>{`
        @keyframes dl-swal-pop {
          0% { transform: scale(0.7); opacity: 0; }
          45% { transform: scale(1.05); opacity: 1; }
          80% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes dl-check-line-tip {
          0% { width: 0; left: 1px; top: 19px; }
          54% { width: 0; left: 1px; top: 19px; }
          70% { width: 13px; left: 0px; top: 28px; }
          84% { width: 13px; left: 0px; top: 28px; }
          100% { width: 13px; left: 0px; top: 28px; }
        }
        @keyframes dl-check-line-long {
          0% { width: 0; right: 30px; top: 40px; }
          65% { width: 0; right: 30px; top: 40px; }
          84% { width: 40px; right: 0px; top: 22px; }
          100% { width: 40px; right: 0px; top: 22px; }
        }
        @keyframes dl-arrow-bob {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(3px); opacity: 0.6; }
        }
        @keyframes dl-x-line-left {
          0% { width: 0; left: 8px; top: 28px; }
          65% { width: 0; left: 8px; top: 28px; }
          84% { width: 34px; left: 6px; top: 28px; }
          100% { width: 34px; left: 6px; top: 28px; }
        }
        @keyframes dl-x-line-right {
          0% { width: 0; right: 8px; top: 28px; }
          65% { width: 0; right: 8px; top: 28px; }
          84% { width: 34px; right: 6px; top: 28px; }
          100% { width: 34px; right: 6px; top: 28px; }
        }
      `}</style>

      <div
        className="relative w-full max-w-md sm:max-w-lg rounded-2xl bg-white shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] px-6 sm:px-10 pt-10 sm:pt-12 pb-8 sm:pb-10 flex flex-col items-center"
        style={{
          animation: "dl-swal-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Icon */}
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 mb-5 sm:mb-6 shrink-0">
          {isDownloading ? (
            <>
              {/* Rotating ring — spins for as long as status stays "downloading" */}
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-[5px] sm:border-[6px] border-emerald-100 border-t-emerald-600 animate-spin" />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="absolute inset-0 m-auto h-8 w-8 sm:h-9 sm:w-9 text-emerald-700"
                style={{ animation: "dl-arrow-bob 1s ease-in-out infinite" }}
              >
                <path
                  d="M12 3v11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M7 10l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 19h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </>
          ) : isSuccess ? (
            <div
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, #ecfdf5 0%, #bbf7d0 100%)",
                boxShadow: "0 0 0 4px #86efac inset",
              }}
            >
              <div className="relative h-9 w-9 sm:h-11 sm:w-11">
                <span
                  className="absolute block h-[3px] sm:h-[4px] rounded-full bg-green-700"
                  style={{ animation: "dl-check-line-tip 0.75s ease forwards" }}
                />
                <span
                  className="absolute block h-[3px] sm:h-[4px] rounded-full bg-green-700"
                  style={{
                    animation: "dl-check-line-long 0.75s ease forwards",
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
                  style={{ animation: "dl-x-line-left 0.6s ease forwards" }}
                />
                <span
                  className="absolute block h-[3px] sm:h-[4px] rounded-full bg-red-600"
                  style={{ animation: "dl-x-line-right 0.6s ease forwards" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Text */}
        {isDownloading ? (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-950 text-center">
              Downloading&hellip;
            </h2>
            <p className="mt-2 text-sm sm:text-base text-emerald-600 text-center break-words max-w-full">
              {fileName ? `Fetching ${fileName}` : "Please wait a moment."}
            </p>
          </>
        ) : isSuccess ? (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-950 text-center">
              Document downloaded successfully
            </h2>
            {fileName && (
              <p className="mt-2 text-sm sm:text-base text-emerald-600 text-center break-words max-w-full">
                {fileName}
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
              Download failed
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500 text-center">
              Something went wrong. Please try again.
            </p>
          </>
        )}

        {/* Buttons — hidden while downloading, only the spinner shows */}
        {!isDownloading && (
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
        )}
      </div>
    </div>,
    document.body
  );
}
