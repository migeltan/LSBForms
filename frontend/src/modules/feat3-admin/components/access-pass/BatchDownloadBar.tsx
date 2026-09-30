import { Download } from "lucide-react";
import {
  BATCH_MAX,
  type BatchSize,
} from "../../../../hooks/useAccessPassBatchDownload";
import { BatchBar } from "../BatchBar";

const SIZE_OPTIONS: { value: BatchSize; label: string }[] = [
  { value: "access-pass", label: "Access Pass (74 × 105 mm)" },
  { value: "pvc-id", label: "PVC ID (54 × 85.6 mm)" },
];

export function BatchDownloadBar({
  selectedCount,
  eligibleCount,
  selecting,
  onStart,
  onCancel,
  size,
  onSizeChange,
  downloading,
  error,
  notice,
  onDownload,
  onSelectAll,
}: {
  selectedCount: number;
  eligibleCount: number;
  selecting: boolean;
  onStart: () => void;
  onCancel: () => void;
  size: BatchSize;
  onSizeChange: (size: BatchSize) => void;
  downloading: boolean;
  error: string | null;
  notice: string | null;
  onDownload: () => void;
  onSelectAll: () => void;
}) {
  return (
    <BatchBar
      label="Batch print"
      hint="Tick the approved applications to include, choose the ID size, then download them together as one ZIP."
      eligibleCount={eligibleCount}
      selectedCount={selectedCount}
      max={BATCH_MAX}
      selecting={selecting}
      onStart={onStart}
      onCancel={onCancel}
      busy={downloading}
      busyText={`Generating ${selectedCount} ID PDF${selectedCount === 1 ? "" : "s"}. This can take a minute, please keep this page open.`}
      actionLabel="Download Selected"
      actionIcon={<Download className="h-4 w-4" />}
      onAction={onDownload}
      onSelectAll={onSelectAll}
      error={error}
      notice={notice}
    >
      <select
        value={size}
        onChange={(e) => onSizeChange(e.target.value as BatchSize)}
        disabled={downloading}
        aria-label="ID size for batch download"
        className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
      >
        {SIZE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </BatchBar>
  );
}
