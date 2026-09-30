import { Download } from "lucide-react";
import {
  BATCH_MAX,
  type BatchSize,
} from "../../../../hooks/useAccessPassBatchDownload";

const SIZE_OPTIONS: { value: BatchSize; label: string }[] = [
  { value: "access-pass", label: "Access Pass (74 × 105 mm)" },
  { value: "pvc-id", label: "PVC ID (54 × 85.6 mm)" },
];

export function BatchDownloadBar({
  selectedCount,
  size,
  onSizeChange,
  downloading,
  error,
  notice,
  onDownload,
  onClear,
}: {
  selectedCount: number;
  size: BatchSize;
  onSizeChange: (size: BatchSize) => void;
  downloading: boolean;
  error: string | null;
  notice: string | null;
  onDownload: () => void;
  onClear: () => void;
}) {
  if (selectedCount === 0 && !error && !notice) return null;
  const tooMany = selectedCount > BATCH_MAX;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-[var(--smart-border)] bg-black/[0.03] px-4 py-3 text-sm"
    >
      {selectedCount > 0 && (
        <>
          <span className="font-semibold">{selectedCount} selected</span>

          <select
            value={size}
            onChange={(e) => onSizeChange(e.target.value as BatchSize)}
            disabled={downloading}
            aria-label="ID size for batch download"
            className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
          >
            {SIZE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onDownload}
            disabled={downloading || tooMany}
            className="inline-flex items-center gap-2 rounded-lg bg-[#15304f] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f2744] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading ? "Generating…" : "Download Selected"}
          </button>

          <button
            type="button"
            onClick={onClear}
            disabled={downloading}
            className="text-xs font-semibold text-[var(--smart-muted)] underline-offset-2 hover:underline disabled:opacity-50"
          >
            Clear
          </button>

          {tooMany && (
            <span className="text-xs text-[var(--smart-red)]">
              Max {BATCH_MAX} per download. Deselect {selectedCount - BATCH_MAX}
              .
            </span>
          )}
        </>
      )}

      {downloading && (
        <span className="text-xs text-[var(--smart-muted)]">
          Generating {selectedCount} ID PDF{selectedCount === 1 ? "" : "s"}.
          This can take a minute, please keep this page open.
        </span>
      )}
      {error && (
        <span className="text-xs text-[var(--smart-red)]">{error}</span>
      )}
      {notice && !error && !downloading && (
        <span className="text-xs text-emerald-700">{notice}</span>
      )}
    </div>
  );
}
