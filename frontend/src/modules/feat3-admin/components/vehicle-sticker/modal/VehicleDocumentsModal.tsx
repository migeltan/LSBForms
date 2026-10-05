import { useRef, useState } from "react";
import { FileText } from "lucide-react";
import type { DocumentRow } from "../../../../../hooks/types";
import { BASE } from "../../../../../hooks/apiConfig";
import { TOKEN_KEY } from "../../../../../providers/AuthProvider";
import { DocumentPreviewModal } from "../../../../../components/modals/DocumentPreviewModal";
import { DownloadModal } from "../../../../../components/modals/DownloadModal";

const SERIF = { fontFamily: '"Source Serif 4", Georgia, serif' } as const;

function GreenSectionHeader({
  icon,
  count,
  children,
}: {
  icon?: React.ReactNode;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center gap-3 text-[#1f3a6b]">
      {icon}
      <h3 className="text-[22px] font-bold leading-none" style={SERIF}>
        {children}
      </h3>
      {count && (
        <span className="rounded-full border border-gray-300 bg-gray-100 px-3 py-0.5 text-xs font-semibold text-gray-600">
          {count}
        </span>
      )}
    </div>
  );
}

function GreenCell({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number | null | undefined;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="mb-2 text-[15px] font-semibold text-gray-900">
        {label}
      </div>
      <div className="min-h-[46px] break-words rounded-2xl border border-gray-300 bg-gray-100 px-5 py-3 text-[15px] font-semibold text-gray-700">
        {value || value === 0 ? value : "\u00A0"}
      </div>
    </div>
  );
}

function VerificationStatusCell({ status }: { status: string }) {
  return <GreenCell label="Verification Status" value={status} />;
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
  const downloadUrl = `${BASE}/api/admin/vehicle-sticker/documents/${documentId}/download`;
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
    <div className="min-w-0">
      <div className="mb-2 text-[15px] font-semibold text-gray-900">File</div>
      <div className="min-h-[46px] rounded-2xl border border-gray-300 bg-gray-100 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center rounded-lg bg-[#15304f] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0f2744]"
          >
            View
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloadStatus === "downloading"}
            className="inline-flex items-center rounded-lg border border-[#15304f]/40 bg-white px-4 py-2 text-xs font-semibold text-[#15304f] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download
          </button>
        </div>

        {editing && (
          <div className="mt-2 pt-2 border-t border-gray-300">
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
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-[#15304f] text-xs font-semibold px-3 py-1.5 ring-1 ring-inset ring-[#15304f]/40 transition-colors"
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

  async function handleView(doc: DocumentRow) {
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      const res = await fetch(
        `${BASE}/api/admin/vehicle-sticker/documents/${doc.id}/file`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      if (!res.ok) throw new Error("Could not load file");
      const blobUrl = URL.createObjectURL(await res.blob());
      setPreview({
        url: blobUrl,
        name: doc.file_name,
        type: doc.document_type,
      });
    } catch {
      window.alert("Could not open the file. Please try again.");
    }
  }

  function closePreview() {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  }

  if (documents.length === 0) {
    return <EmptyState />;
  }
  return (
    <>
      <GreenSectionHeader
        icon={<FileText className="h-6 w-6 shrink-0" />}
        count={`${documents.length} ${documents.length === 1 ? "file" : "files"}`}
      >
        Uploaded Documents
      </GreenSectionHeader>

      <div className="flex flex-col gap-6">
        {documents.map((doc, idx) => (
          <div
            key={doc.id}
            className="border-t border-gray-300 pt-6 first:border-t-0 first:pt-0"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#15304f] px-2 text-xs font-bold text-white">
                {idx + 1}
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#1f3a6b]">
                Document {idx + 1} of {documents.length}
              </span>
              {doc.document_type && (
                <span className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-gray-500">
                  · {doc.document_type}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-3">
              <GreenCell
                label="File Name"
                value={doc.file_name}
                className="sm:col-span-3"
              />
              <GreenCell label="Document Type" value={doc.document_type} />
              <VerificationStatusCell status={doc.verification_status} />
              <FileActionCell
                documentId={doc.id}
                fileName={doc.file_name}
                editing={editing}
                uploading={uploadingId === doc.id}
                uploadError={uploadError[doc.id] ?? null}
                onView={() => handleView(doc)}
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
        onClose={closePreview}
      />
    </>
  );
}
