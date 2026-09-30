import { useEffect, useState } from "react";
import type { VehicleStickerRow } from "../../../../hooks/types";
import { StatusBadge } from "../StatusBadge";
import { AdminTableShell } from "../AdminTableShell";
import type { AdminColumn } from "../AdminTableShell";
import { VehicleDetailModal } from "./VehicleDetailModal";
import { TOKEN_KEY } from "../../../../providers/AuthProvider";
import { BASE } from "../../../../hooks/apiConfig";
import {
  useVehicleStickerBatchPrint,
  type SheetPaper,
  type SheetLayout,
} from "../../../../hooks/useVehicleStickerBatchPrint";
import { BatchPrintBar } from "./BatchPrintBar";

const ENDPOINT = `${BASE}/api/admin/vehicle-sticker`;

const COLUMNS: AdminColumn<VehicleStickerRow>[] = [
  {
    header: "No.",
    align: "center",
    className: "w-16 text-[var(--smart-muted)]",
    render: (_row, i) => String(i + 1).padStart(2, "0"),
  },
  {
    header: "Application ID",
    className: "font-mono text-xs text-[var(--smart-muted)]",
    render: (row) => row.application_id,
  },
  {
    header: "Full Name",
    mobile: "title",
    className: "font-medium",
    render: (row) => row.full_name,
  },
  {
    header: "Applicant Type",
    className: "text-[var(--smart-muted)]",
    render: (row) => row.applicant_type,
  },
  {
    header: "Plate Number",
    className: "font-mono text-xs uppercase",
    render: (row) => row.plate_number,
  },
  {
    header: "Date Submitted",
    className: "text-[var(--smart-muted)]",
    render: (row) => row.date_submitted,
  },
  {
    header: "Status",
    mobile: "badge",
    render: (row) => <StatusBadge status={row.status} />,
  },
];

const searchText = (r: VehicleStickerRow) =>
  `${r.application_id} ${r.full_name} ${r.applicant_type} ${r.plate_number} ${r.date_submitted} ${r.status}`;

const rowKey = (r: VehicleStickerRow) => r.application_id;

const ICON = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 13l2-6a2 2 0 0 1 2-1.4h10a2 2 0 0 1 2 1.4l2 6" />
    <path d="M3 13h18v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4Z" />
    <circle cx="7.5" cy="15.5" r="0.5" fill="currentColor" />
    <circle cx="16.5" cy="15.5" r="0.5" fill="currentColor" />
  </svg>
);

export function VehicleStickerTable() {
  const [rows, setRows] = useState<VehicleStickerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState<number | null>(
    null,
  );

  // Batch print: selection is keyed by application_id (the row key).
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(
    new Set(),
  );
  const [selecting, setSelecting] = useState(false);
  const [paper, setPaper] = useState<SheetPaper>("a4");
  const [sheetLayout, setSheetLayout] = useState<SheetLayout>("compact");
  const batch = useVehicleStickerBatchPrint();
  const approvedKeys = rows
    .filter((r) => r.status === "Approved")
    .map((r) => r.application_id);
  const selectedIds = rows
    .filter((r) => selectedKeys.has(r.application_id))
    .map((r) => r.applicant_id);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem(TOKEN_KEY);
        const res = await fetch(ENDPOINT, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Request failed");
        const data: VehicleStickerRow[] = await res.json();
        if (!cancelled) setRows(data);
      } catch {
        if (!cancelled)
          setError("Could not load Vehicle Sticker applications.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <AdminTableShell
        tableNumber="02"
        title="Vehicle Sticker Application"
        accent="yellow"
        icon={ICON}
        columns={COLUMNS}
        rows={rows}
        rowKey={rowKey}
        searchText={searchText}
        onRowClick={(row) => setSelectedApplicantId(row.applicant_id)}
        loading={loading}
        error={error}
        selectable={selecting}
        isSelectable={(r) => r.status === "Approved"}
        selectedKeys={selectedKeys}
        onSelectionChange={(keys) => {
          setSelectedKeys(keys);
          batch.reset();
        }}
        toolbar={
          <BatchPrintBar
            selectedCount={selectedIds.length}
            eligibleCount={approvedKeys.length}
            selecting={selecting}
            onStart={() => setSelecting(true)}
            onCancel={() => {
              setSelecting(false);
              setSelectedKeys(new Set());
              batch.reset();
            }}
            paper={paper}
            onPaperChange={setPaper}
            sheetLayout={sheetLayout}
            onSheetLayoutChange={setSheetLayout}
            printing={batch.printing}
            error={batch.error}
            notice={batch.notice}
            onPrint={() => batch.print(selectedIds, paper, sheetLayout)}
            onSelectAll={() => {
              setSelectedKeys(new Set(approvedKeys));
              batch.reset();
            }}
          />
        }
      />
      <VehicleDetailModal
        applicantId={selectedApplicantId}
        onClose={() => setSelectedApplicantId(null)}
      />
    </>
  );
}
