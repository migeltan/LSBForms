import { createPortal } from "react-dom";
import { CloseButton } from "../buttons/CloseButton";

function getFileKind(fileName: string): "image" | "pdf" | "other" {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  return "other";
}

export function DocumentPreviewModal({
  open,
  fileUrl,
  fileName,
  documentType,
  onClose,
}: {
  open: boolean;
  fileUrl: string | null;
  fileName: string;
  documentType?: string;
  onClose: () => void;
}) {
  if (!open || !fileUrl) return null;

  const kind = getFileKind(fileName);

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full sm:h-[85vh] sm:max-w-4xl rounded-none sm:rounded-xl bg-white shadow-[0_25px_70px_-20px_rgba(15,39,68,0.5)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative shrink-0 overflow-hidden bg-white border-b"
          style={{ borderColor: "var(--smart-navy, #0f2744)" }}
        >
          {/* Diagonal red/gold stripe, right edge — matches the app's banner accent */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-20 sm:w-28"
          >
            <div
              className="absolute inset-y-0 right-0 w-full"
              style={{
                backgroundColor: "var(--smart-red, #c0392b)",
                clipPath: "polygon(45% 0, 100% 0, 100% 100%, 15% 100%)",
              }}
            />
            <div
              className="absolute inset-y-0 right-0 w-2/3"
              style={{
                backgroundColor: "var(--smart-gold, #d4a017)",
                clipPath: "polygon(55% 0, 100% 0, 100% 100%, 25% 100%)",
              }}
            />
            <div
              className="absolute inset-y-0 right-0 w-1/3"
              style={{
                backgroundColor: "var(--smart-navy, #0f2744)",
                clipPath: "polygon(65% 0, 100% 0, 100% 100%, 35% 100%)",
              }}
            />
          </div>

          <div className="relative z-10 flex items-center gap-3 pl-4 sm:pl-5 pr-16 sm:pr-24 py-3 sm:py-4">
            <div className="min-w-0">
              {documentType && (
                <div
                  className="text-[10px] font-bold uppercase tracking-wide truncate"
                  style={{ color: "var(--smart-gold, #d4a017)" }}
                >
                  {documentType}
                </div>
              )}
              <h3
                className="text-sm sm:text-base font-bold truncate min-w-0"
                style={{ color: "var(--smart-navy, #0f2744)" }}
              >
                {fileName}
              </h3>
            </div>
          </div>

          <CloseButton
            onClick={onClose}
            ariaLabel="Close preview"
            className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-3 z-20"
          />
        </div>

        <div className="flex-1 min-h-0 bg-gray-100 flex items-center justify-center overflow-auto">
          {kind === "image" && (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain"
            />
          )}
          {kind === "pdf" && (
            <iframe
              src={`${fileUrl}#toolbar=0`}
              title={fileName}
              className="w-full h-full border-0"
            />
          )}
          {kind === "other" && (
            <div className="text-center text-sm text-gray-500 px-6">
              <p>Preview isn&apos;t available for this file type.</p>
              <a
                href={fileUrl}
                download={fileName}
                className="mt-3 inline-block font-semibold hover:underline"
                style={{ color: "var(--smart-red, #c0392b)" }}
              >
                Download instead
              </a>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
