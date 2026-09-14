import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../../api/client";

// ---------------------------------------------------------------------------
// Adjust these two values to resize the modal. Any valid CSS size works,
// e.g. "1100px", "70rem", "80vw", "92vh".
// ---------------------------------------------------------------------------
const WIDTH = "1024px";
const HEIGHT = "860px";

// Distinct from ApplicantIdPreviewModal: this is the "pre-approval" quick
// look reviewers use before deciding, so it's styled with an orange accent
// (matching the "Preview ID" trigger button) and labeled as a draft/test
// preview rather than the final approved ID artifact.
//
// Unlike ApplicantIdPreviewModal (which srcDoc's the lightweight HTML
// preview route), this renders the *actual generated PDF* — fetched as a
// blob from downloadUrl and handed to an <iframe> as an object URL — so
// the browser's own native PDF viewer (page nav, zoom, print, download
// controls) takes over, matching exactly what the reviewer would get if
// they opened the downloaded file.
type PreviewType = "access-pass" | "vehicle-sticker";

const COPY: Record<PreviewType, { title: string; description: string }> = {
  "access-pass": {
    title: "Access Pass ID — Test Preview",
    description: "Draft render for review. Not yet approved.",
  },
  "vehicle-sticker": {
    title: "Vehicle Sticker ID — Test Preview",
    description: "Draft render for review. Not yet approved.",
  },
};

export function ApplicantIdTestPreview({
  type,
  downloadUrl,
  fileName = "ID.pdf",
  onClose,
  onDownloaded,
}: {
  type: PreviewType;
  downloadUrl: string;
  fileName?: string;
  onClose: () => void;
  onDownloaded: () => void;
}) {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const downloadInFlight = useRef(false);
  const copy = COPY[type];

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function loadPdf() {
      setLoadingPreview(true);
      setError(null);
      try {
        const res = await api.get(downloadUrl, {
          headers: { Accept: "application/pdf" },
          responseType: "blob",
        });

        if (cancelled) return;

        const blob: Blob =
          res.data instanceof Blob
            ? res.data
            : new Blob([res.data], { type: "application/pdf" });

        objectUrl = window.URL.createObjectURL(blob);
        setPdfBlob(blob);
        setPdfObjectUrl(objectUrl);
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

    loadPdf();

    return () => {
      cancelled = true;
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
    };
  }, [downloadUrl]);

  function handleDownload() {
    if (downloadInFlight.current || !pdfBlob) return;
    downloadInFlight.current = true;

    try {
      const objectUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);

      onDownloaded();
    } finally {
      downloadInFlight.current = false;
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 sm:p-6">
      <style>{`
        @keyframes aitp-pop {
          0% { transform: scale(0.92) translateY(8px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes aitp-stripe {
          0% { background-position: 0 0; }
          100% { background-position: 28px 0; }
        }
        @keyframes aitp-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="relative w-full rounded-2xl bg-white shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden ring-1 ring-orange-200"
        style={{
          animation: "aitp-pop 0.3s ease forwards",
          width: WIDTH,
          height: HEIGHT,
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      >
        {/* Draft/test hazard stripe — visually distinguishes this from the
            final-preview modal at a glance */}
        <div
          className="h-1.5 shrink-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #f97316 0, #f97316 10px, #fed7aa 10px, #fed7aa 20px)",
            backgroundSize: "28px 100%",
            animation: "aitp-stripe 1.2s linear infinite",
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-orange-100 sm:px-6 bg-orange-50/60 shrink-0">
          <div className="flex items-start min-w-0 gap-3">
            <span className="inline-flex items-center rounded-full bg-orange-100 text-orange-700 ring-1 ring-orange-300 px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase shrink-0">
              Test Preview
            </span>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-[var(--smart-navy,#1e3a5f)] leading-tight">
                {copy.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{copy.description}</p>
            </div>
          </div>

          {/* Close + Download, right side */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              disabled={!pdfBlob}
              className="inline-flex items-center gap-1.5 rounded-md bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 shadow-sm transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10 2a1 1 0 0 1 1 1v8.09l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42l2.3 2.3V3a1 1 0 0 1 1-1Z" />
                <path d="M4 15a1 1 0 0 1 1 1v1h10v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" />
              </svg>
              Download
            </button>

            <button
              onClick={onClose}
              aria-label="Close test preview"
              className="inline-flex items-center justify-center text-orange-600 transition-colors bg-white rounded-md h-9 w-9 hover:bg-orange-100 ring-1 ring-inset ring-orange-200"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path
                  fillRule="evenodd"
                  d="M10 8.59 6.7 5.29a1 1 0 0 0-1.41 1.42L8.59 10l-3.3 3.29a1 1 0 1 0 1.41 1.42L10 11.41l3.29 3.3a1 1 0 0 0 1.42-1.42L11.41 10l3.3-3.29a1 1 0 0 0-1.42-1.42L10 8.59Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Preview body — the real generated PDF, rendered by the browser's
            native PDF viewer (its own toolbar, zoom, page nav, print). While
            loading, this shows a centered SweetAlert-style spinner on a
            plain white background; once the PDF is ready it swaps to the
            native iframe viewer. */}
        <div
          className={`flex-1 min-h-0 flex items-center justify-center transition-colors ${
            loadingPreview ? "bg-white" : "bg-gray-600"
          }`}
        >
          {loadingPreview ? (
            <div className="flex flex-col items-center justify-center gap-5">
              <svg
                viewBox="0 0 50 50"
                className="w-20 h-20 text-orange-500"
                style={{ animation: "aitp-spin 0.9s linear infinite" }}
              >
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="90 150"
                />
              </svg>
              <p className="text-lg font-semibold text-gray-700">
                Generating the ID Preview
              </p>
            </div>
          ) : error ? null : (
            <iframe
              title={copy.title}
              src={pdfObjectUrl ?? undefined}
              className="w-full h-full border-none"
            />
          )}
        </div>

        {error && (
          <div className="px-5 py-3 border-t border-red-100 sm:px-6 bg-red-50 shrink-0">
            <p className="text-sm text-[var(--smart-red,#c0392b)]">{error}</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
