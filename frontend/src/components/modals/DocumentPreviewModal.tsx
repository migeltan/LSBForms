import { useEffect } from "react";
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
  // Esc closes the viewer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
        <div className="flex shrink-0 items-center gap-3 bg-[#15304f] px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            {documentType && (
              <div className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
                {documentType}
              </div>
            )}
            <h3
              className="truncate text-base font-bold sm:text-lg"
              title={fileName}
              style={{ color: "#ffffff", fontFamily: "var(--smart-font-sans)" }}
            >
              {fileName}
            </h3>
          </div>
          <CloseButton onClick={onClose} ariaLabel="Close preview" />
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
    document.body,
  );
}
