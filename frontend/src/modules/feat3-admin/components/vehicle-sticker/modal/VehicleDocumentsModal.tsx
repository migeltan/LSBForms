import { useRef, useState } from "react";
import type { DocumentRow } from "../../../../../hooks/types";
import { STORAGE_BASE, BASE } from "../../../../../hooks/apiConfig";
import { TOKEN_KEY } from "../../../../../providers/AuthProvider";
import { DocumentPreviewModal } from "../../../../../components/modals/DocumentPreviewModal";
import { DownloadModal } from "../../../../../components/modals/DownloadModal";

function GreenSectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="h-2 w-2 rotate-45 shrink-0 bg-emerald-600" />
      <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-900">
        {children}
      </h3>
    </div>
  );
}

function GreenCell({
  label,
  value,
  shade,
}: {
  label: string;
  value: string | number | null | undefined;
  shade: "light" | "medium" | "dark";
}) {
  const borderShade =
    shade === "light"
      ? "border-l-emerald-300"
      : shade === "medium"
        ? "border-l-emerald-500"
        : "border-l-emerald-700";

  return (
    <div
      className={`rounded-md border border-emerald-100 border-l-4 ${borderShade} bg-emerald-50/50 px-3 py-2`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-emerald-950">
        {value || value === 0 ? value : "—"}
      </div>
    </div>
  );
}

function VerificationStatusCell({ status }: { status: string }) {
  return (
    <div className="rounded-md border border-emerald-100 border-l-4 border-l-emerald-500 bg-emerald-50/50 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
        Verification Status
      </div>
      <div className="mt-1">
        <span className="inline-block rounded-full bg-emerald-600 text-white text-xs font-semibold px-3 py-0.5">
          {status}
        </span>
      </div>
    </div>
  );
}

function FileActionCell({
  documentId,
  fileName,
  editing,
  uploading,
  uploadError,
  onView,
  onReplace,
}: {
  documentId: number;
  fileName: string;
  editing: boolean;
  uploading: boolean;
  uploadError: string | null;
  onView: () => void;
  onReplace: (file: File) => void;
}) {
  const downloadUrl = `${BASE}/api/vehicle-sticker/documents/${documentId}/download`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [downloadStatus, setDownloadStatus] = useState<
    "idle" | "downloading" | "success" | "error"
  >("idle");

  async function handleDownload() {
    setDownloadStatus("downloading");
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      const res = await fetch(downloadUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);

      setDownloadStatus("success");
    } catch {
      setDownloadStatus("error");
    }
  }

  return (
    <div className="rounded-md border border-emerald-100 border-l-4 border-l-emerald-700 bg-emerald-50/50 px-3 py-2 flex flex-col">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
        File
      </div>
      <div className="mt-1.5 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 shadow-sm shadow-emerald-700/30 transition-colors"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path
              d="M4 4h6M4 8h6M4 12h4M8 14l3 3 5-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          View
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloadStatus === "downloading"}
          className="inline-flex items-center gap-1.5 rounded-md bg-white hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-800 text-xs font-semibold px-3 py-1.5 ring-1 ring-inset ring-emerald-700/40 transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M10 12.5a1 1 0 0 1-.7-.29l-4-4a1 1 0 1 1 1.4-1.42L9 9.09V3a1 1 0 1 1 2 0v6.09l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-.7.29Z" />
            <path d="M4 13a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a1 1 0 1 1 2 0v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1a1 1 0 0 1 1-1Z" />
          </svg>
          Download
        </button>
      </div>

      {editing && (
        <div className="mt-2 pt-2 border-t border-emerald-200/70">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onReplace(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-white hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-800 text-xs font-semibold px-3 py-1.5 ring-1 ring-inset ring-emerald-700/40 transition-colors"
          >
            {uploading ? (
              <>
                <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Uploading&hellip;
              </>
            ) : (
              "Replace File"
            )}
          </button>
          {uploadError && (
            <p className="mt-1 text-[10px] text-[var(--smart-red,#c0392b)] text-center">
              {uploadError}
            </p>
          )}
        </div>
      )}

      {downloadStatus !== "idle" && (
        <DownloadModal
          status={
            downloadStatus === "downloading" ? "downloading" : downloadStatus
          }
          fileName={fileName}
          onDone={() => setDownloadStatus("idle")}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 ring-1 ring-emerald-200">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-6 w-6 text-emerald-700"
        >
          <path
            d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
            fill="currentColor"
            opacity="0.15"
          />
          <path
            d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M14 2v5h5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="mt-3 text-sm font-semibold text-emerald-900">
        No documents submitted
      </p>
      <p className="text-xs text-emerald-600 mt-1">
        This applicant hasn&apos;t uploaded any documents yet.
      </p>
    </div>
  );
}

export function VehicleDocumentsModal({
  documents,
  editing,
  onDocumentUpdated,
}: {
  documents: DocumentRow[];
  editing: boolean;
  onDocumentUpdated: (updated: DocumentRow) => void;
}) {
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<Record<number, string>>({});
  const [preview, setPreview] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);

  async function handleReplace(doc: DocumentRow, file: File) {
    setUploadingId(doc.id);
    setUploadError((prev) => {
      const next = { ...prev };
      delete next[doc.id];
      return next;
    });

    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${BASE}/api/admin/vehicle-sticker/documents/${doc.id}/update`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        },
      );
      if (!res.ok) throw new Error("Upload failed");
      const updated: DocumentRow = await res.json();
      onDocumentUpdated(updated);
    } catch {
      setUploadError((prev) => ({
        ...prev,
        [doc.id]: "Could not upload the file. Please try again.",
      }));
    } finally {
      setUploadingId(null);
    }
  }

  if (documents.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <GreenSectionHeader>
        Uploaded Documents
        <span className="ml-2 normal-case tracking-normal font-medium text-emerald-600 text-xs">
          {documents.length} {documents.length === 1 ? "file" : "files"}
        </span>
      </GreenSectionHeader>

      <div className="flex flex-col gap-4">
        {documents.map((doc, idx) => (
          <div
            key={doc.id}
            className="rounded-lg border border-emerald-100 border-l-4 border-l-emerald-600 bg-white shadow-sm hover:shadow-md hover:shadow-emerald-100 hover:-translate-y-0.5 transition-all duration-150 px-4 py-4"
          >
            <div className="flex items-start gap-2 mb-3 min-w-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm shadow-emerald-600/30">
                {idx + 1}
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  File Name
                </div>
                <h4 className="text-sm sm:text-base font-bold text-emerald-950 leading-tight truncate">
                  {doc.file_name}
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <GreenCell
                label="Document Type"
                value={doc.document_type}
                shade="light"
              />
              <VerificationStatusCell status={doc.verification_status} />
              <FileActionCell
                documentId={doc.id}
                fileName={doc.file_name}
                editing={editing}
                uploading={uploadingId === doc.id}
                uploadError={uploadError[doc.id] ?? null}
                onView={() =>
                  setPreview({
                    url: STORAGE_BASE + "/" + doc.file_path,
                    name: doc.file_name,
                    type: doc.document_type,
                  })
                }
                onReplace={(file) => handleReplace(doc, file)}
              />
            </div>
          </div>
        ))}
      </div>

      <DocumentPreviewModal
        open={preview !== null}
        fileUrl={preview?.url ?? null}
        fileName={preview?.name ?? ""}
        documentType={preview?.type}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
