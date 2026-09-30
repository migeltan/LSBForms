import { Printer } from "lucide-react";
import {
  STICKER_BATCH_MAX,
  type SheetLayout,
  type SheetPaper,
} from "../../../../hooks/useVehicleStickerBatchPrint";
import { BatchBar } from "../BatchBar";

const PAPER_OPTIONS: { value: SheetPaper; label: string }[] = [
  { value: "a4", label: "A4" },
  { value: "letter", label: "Letter" },
];

const LAYOUT_OPTIONS: { value: SheetLayout; label: string }[] = [
  { value: "compact", label: "12 per page · landscape (scaled)" },
  { value: "actual", label: "Actual size · portrait (4 per page)" },
];

const SELECT_CLASS =
  "rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50";

export function BatchPrintBar({
  selectedCount,
  eligibleCount,
  selecting,
  onStart,
  onCancel,
  paper,
  onPaperChange,
  sheetLayout,
  onSheetLayoutChange,
  printing,
  error,
  notice,
  onPrint,
  onSelectAll,
}: {
  selectedCount: number;
  eligibleCount: number;
  selecting: boolean;
  onStart: () => void;
  onCancel: () => void;
  paper: SheetPaper;
  onPaperChange: (paper: SheetPaper) => void;
  sheetLayout: SheetLayout;
  onSheetLayoutChange: (layout: SheetLayout) => void;
  printing: boolean;
  error: string | null;
  notice: string | null;
  onPrint: () => void;
  onSelectAll: () => void;
}) {
  return (
    <BatchBar
      label="Batch print"
      hint="Tick the approved decals to include, choose paper and layout, then generate one printable sheet."
      eligibleCount={eligibleCount}
      selectedCount={selectedCount}
      max={STICKER_BATCH_MAX}
      selecting={selecting}
      onStart={onStart}
      onCancel={onCancel}
      busy={printing}
      busyText={`Laying out ${selectedCount} decal${selectedCount === 1 ? "" : "s"}…`}
      actionLabel="Generate Print Sheet"
      actionIcon={<Printer className="h-4 w-4" />}
      onAction={onPrint}
      onSelectAll={onSelectAll}
      error={error}
      notice={notice}
    >
      <select
        value={paper}
        onChange={(e) => onPaperChange(e.target.value as SheetPaper)}
        disabled={printing}
        aria-label="Paper size"
        className={SELECT_CLASS}
      >
        {PAPER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        value={sheetLayout}
        onChange={(e) => onSheetLayoutChange(e.target.value as SheetLayout)}
        disabled={printing}
        aria-label="Sheet layout"
        className={SELECT_CLASS}
      >
        {LAYOUT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </BatchBar>
  );
}
