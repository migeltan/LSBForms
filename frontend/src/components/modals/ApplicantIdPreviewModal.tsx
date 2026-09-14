import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../../api/client";

// `type` lets this one modal serve both Access Pass and Vehicle Sticker
// flows — title/description derive from it instead of being hardcoded
// to "Access Pass".
type PreviewType = "access-pass" | "vehicle-sticker";

const COPY: Record<PreviewType, { title: string; description: string }> = {
  "access-pass": {
    title: "Access Pass ID Preview",
    description: "Review the generated ID before downloading.",
  },
  "vehicle-sticker": {
    title: "Vehicle Sticker ID Preview",
    description: "Review the generated sticker before downloading.",
  },
};

export function ApplicantIdPreviewModal({
  type,
  previewUrl,
  downloadUrl,
  fileName = "ID.pdf",
  onClose,
  onDownloaded,
}: {
  type: "access-pass" | "vehicle-sticker";
  previewUrl: string;
  downloadUrl: string;
  fileName?: string;
  onClose: () => void;
  onDownloaded: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  // Synchronous guard, ahead of React state — blocks a fast
  // double-click/Enter repeat from firing two download requests
  // (and therefore two Browsershot/Puppeteer spawns) before the
  // `downloading` state has a chance to re-render the disabled button.
  const downloadInFlight = useRef(false);
  const copy = COPY[type];

  // An <iframe src={previewUrl}> is a bare browser navigation and
  // drops the Bearer token, so this admin-only route came back as
  // {"message":"Unauthenticated."}. Fetch it through the shared `api`
  // client (same Bearer-token interceptor as every other admin call)
  // and feed the HTML to the iframe via srcdoc instead.
  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      setLoadingPreview(true);
      setError(null);
      try {
        const res = await api.get<string>(previewUrl, {
          headers: { Accept: "text/html" },
          responseType: "text",
        });

        if (!cancelled) {
          setPreviewHtml(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Could not load the preview.");
        }
      } finally {
        if (!cancelled) {
          setLoadingPreview(false);
        }
      }
    }

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [previewUrl]);

  async function handleDownload() {
    if (downloadInFlight.current) return;
    downloadInFlight.current = true;

    setError(null);
    setDownloading(true);
    try {
      const res = await api.get(downloadUrl, {
        headers: { Accept: "application/pdf" },
        responseType: "blob",
      });

      const objectUrl = window.URL.createObjectURL(res.data);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);

      onDownloaded();
    } catch (err) {
      setError("Could not download the ID.");
    } finally {
      setDownloading(false);
      downloadInFlight.current = false;
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 sm:p-6">
      <style>{`
        @keyframes aipm-pop {
          0% { transform: scale(0.92) translateY(8px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>

      <div
        className="relative w-full max-w-5xl rounded-2xl bg-white shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
        style={{ animation: "aipm-pop 0.3s ease forwards", maxHeight: "94vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-200 bg-[var(--smart-navy,#1e3a5f)]/[0.03]">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-[var(--smart-navy,#1e3a5f)] leading-tight">
              {copy.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{copy.description}</p>
          </div>

          {/* Close + Download, right side */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--smart-navy,#1e3a5f)] hover:bg-[var(--smart-navy,#1e3a5f)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 shadow-sm transition-colors"
            >
              {downloading ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                  />
                  <path
                    d="M21 12a9 9 0 0 0-9-9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="opacity-90"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M10 2a1 1 0 0 1 1 1v8.09l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42l2.3 2.3V3a1 1 0 0 1 1-1Z" />
                  <path d="M4 15a1 1 0 0 1 1 1v1h10v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" />
                </svg>
              )}
              {downloading ? "Downloading..." : "Download"}
            </button>

            <button
              onClick={onClose}
              aria-label="Close preview"
              className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-white hover:bg-gray-100 ring-1 ring-inset ring-gray-200 text-gray-500 transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path
                  fillRule="evenodd"
                  d="M10 8.59 6.7 5.29a1 1 0 0 0-1.41 1.42L8.59 10l-3.3 3.29a1 1 0 1 0 1.41 1.42L10 11.41l3.29 3.3a1 1 0 0 0 1.42-1.42L11.41 10l3.3-3.29a1 1 0 0 0-1.42-1.42L10 8.59Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Preview body */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 sm:p-6 flex items-center justify-center">
          {loadingPreview ? (
            <p className="text-sm text-gray-500">Loading preview…</p>
          ) : (
            <iframe
              title={copy.title}
              srcDoc={previewHtml ?? ""}
              className="w-full h-[70vh] rounded-lg border border-gray-200 bg-white shadow-sm"
            />
          )}
        </div>

        {error && (
          <div className="px-5 sm:px-6 py-3 border-t border-red-100 bg-red-50">
            <p className="text-sm text-[var(--smart-red,#c0392b)]">{error}</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
