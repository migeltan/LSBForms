import { useEffect, useMemo, useState } from "react";
import type { ApplicationSearchRow } from "../../../hooks/types"; // adjust path to your types file
import { StatusModalProfile } from "./StatusModalProfile"; // new

/* ---------------------------------------------------------------------
 * Change this to resize the whole results card. Plain value applied
 * via inline style (not a Tailwind class) so any CSS length works.
 * Matches FILTER_TAB_MAX_WIDTH in StatusTabFilter.tsx by default.
 * ------------------------------------------------------------------- */
const TABLE_MAX_WIDTH = "1500px"; // e.g. "1200px", "90rem", "100%"

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const;

export type StatusTabSearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; rows: ApplicationSearchRow[] };

interface StatusTabTableProps {
  search: StatusTabSearchState;
}

const COLUMNS = [
  "No.",
  "Application ID",
  "Application Type",
  "Name",
  "Date Submitted",
  "Status",
] as const;

/* ---------------------------------------------------------------------
 * Dot-indicator pill for the Application Type cell — blue for Access
 * Pass, indigo for Vehicle Sticker, gray fallback for anything else.
 * ------------------------------------------------------------------- */
function TypeBadge({ type }: { type: string }) {
  const normalized = type.toLowerCase();
  const isVehicle = normalized.includes("vehicle");
  const isAccess = normalized.includes("access");

  const dot = isVehicle ? "#6366f1" : isAccess ? "#2563eb" : "#6b7280";
  const textColor = isVehicle
    ? "text-indigo-700"
    : isAccess
      ? "text-blue-700"
      : "text-gray-600";
  const bgColor = isVehicle
    ? "bg-indigo-50"
    : isAccess
      ? "bg-blue-50"
      : "bg-gray-100";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${bgColor} ${textColor}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: dot }}
      />
      {type}
    </span>
  );
}

/* ---------------------------------------------------------------------
 * Dot-indicator pill for the Status cell.
 * ------------------------------------------------------------------- */
const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string }> =
  {
    Approved: { dot: "#10b981", text: "text-emerald-700", bg: "bg-emerald-50" },
    Completed: {
      dot: "#10b981",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    Rejected: { dot: "#ef4444", text: "text-red-700", bg: "bg-red-50" },
    "Incomplete/Returned": {
      dot: "#f59e0b",
      text: "text-amber-700",
      bg: "bg-amber-50",
    },
    Submitted: { dot: "#3b82f6", text: "text-blue-700", bg: "bg-blue-50" },
    "Under Review": { dot: "#3b82f6", text: "text-blue-700", bg: "bg-blue-50" },
  };

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? {
    dot: "#6b7280",
    text: "text-gray-600",
    bg: "bg-gray-100",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: style.dot }}
      />
      {status}
    </span>
  );
}

/* ---------------------------------------------------------------------
 * Body-only empty/loading/error state. Rendered as a single row so the
 * <thead> with the column titles stays visible at all times, even with
 * zero results / before a search / mid-error.
 * ------------------------------------------------------------------- */
function StateRow({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "error";
}) {
  return (
    <tr>
      <td
        colSpan={COLUMNS.length}
        className={`px-6 py-12 text-center text-sm ${
          tone === "error" ? "font-medium text-red-600" : "text-gray-500"
        }`}
      >
        {children}
      </td>
    </tr>
  );
}

/* ---------------------------------------------------------------------
 * Rows-per-page segmented control — lives in the header, upper right.
 * ------------------------------------------------------------------- */
function PageSizeControl({
  pageSize,
  onPageSizeChange,
}: {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap text-[11px] font-medium text-gray-500">
        Rows per page
      </span>
      <div className="flex rounded-full border border-gray-200 bg-white p-0.5 shadow-sm">
        {PAGE_SIZE_OPTIONS.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onPageSizeChange(size)}
            aria-current={pageSize === size}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
              pageSize === size
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
 * Pagination footer — centered range summary + prev/next.
 * ------------------------------------------------------------------- */
function PaginationBar({
  page,
  totalRows,
  totalPages,
  startRow,
  endRow,
  onPageChange,
}: {
  page: number;
  totalRows: number;
  totalPages: number;
  startRow: number;
  endRow: number;
  onPageChange: (page: number) => void;
}) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/60 sm:px-8">
      <div className="flex items-center justify-center max-w-md gap-3 mx-auto">
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
          {totalRows === 0
            ? "0 results"
            : `${startRow}–${endRow} of ${totalRows}`}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrev}
            aria-label="Previous page"
            className="flex items-center justify-center w-8 h-8 text-gray-500 transition-all bg-white border border-gray-200 rounded-full shadow-sm hover:border-gray-300 hover:text-gray-800 hover:shadow disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:border-gray-200 disabled:hover:text-gray-500"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <span className="min-w-[92px] text-center text-xs font-semibold text-gray-700">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
            aria-label="Next page"
            className="flex items-center justify-center w-8 h-8 text-gray-500 transition-all bg-white border border-gray-200 rounded-full shadow-sm hover:border-gray-300 hover:text-gray-800 hover:shadow disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:border-gray-200 disabled:hover:text-gray-500"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// New: normalizes the free-text application_type from search results
// ("Access Pass" / "Vehicle Sticker") into the discriminator the modal
// and its API call expect.
function toApplicationTypeSlug(
  type: string
): "access-pass" | "vehicle-sticker" | null {
  const normalized = type.toLowerCase();
  if (normalized.includes("vehicle")) return "vehicle-sticker";
  if (normalized.includes("access")) return "access-pass";
  return null;
}

export function StatusTabTable({ search }: StatusTabTableProps) {
  const rows = search.status === "success" ? search.rows : [];
  const resultCount = rows.length;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[1]); // default 10

  // New: which row's modal is open, if any.
  const [selectedApplicant, setSelectedApplicant] = useState<{
    id: number | string;
    type: "access-pass" | "vehicle-sticker";
  } | null>(null);

  // Reset to page 1 whenever a new result set comes in (new search,
  // filter change, etc.) so the user isn't stranded on a stale page.
  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  // Clamp page if a pageSize change (or a shrinking result set) would
  // otherwise put it past the last page.
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const startRow = resultCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, resultCount);

  // New: row click handler — skips rows with no usable applicant_id or
  // an unrecognized type, since the modal can't fetch a profile for them.
  function handleRowClick(row: ApplicationSearchRow) {
    const typeSlug = toApplicationTypeSlug(row.application_type);
    if (row.applicant_id == null || !typeSlug) return;
    setSelectedApplicant({ id: row.applicant_id, type: typeSlug });
  }

  const tableBody = (() => {
    if (search.status === "idle") {
      return <StateRow>Use the search above to find an application.</StateRow>;
    }
    if (search.status === "loading") {
      return (
        <StateRow>
          <span className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            Searching…
          </span>
        </StateRow>
      );
    }
    if (search.status === "error") {
      return <StateRow tone="error">{search.message}</StateRow>;
    }
    if (resultCount === 0) {
      return <StateRow>No applications matched your search.</StateRow>;
    }
    return paginatedRows.map((row, i) => (
      <tr
        key={`${row.application_id}-${(page - 1) * pageSize + i}`}
        onClick={() => handleRowClick(row)}
        className="transition-colors border-b cursor-pointer border-gray-50 last:border-b-0 hover:bg-gray-50/80"
      >
        <td className="px-5 py-3 text-gray-400">
          {(page - 1) * pageSize + i + 1}
        </td>
        <td className="px-5 py-3 font-mono text-xs font-semibold text-gray-800">
          {row.application_id}
        </td>
        <td className="px-5 py-3">
          <TypeBadge type={row.application_type} />
        </td>
        <td className="px-5 py-3 font-medium text-gray-800">
          {row.name ?? "—"}
        </td>
        <td className="px-5 py-3 text-gray-500">{row.date_submitted ?? "—"}</td>
        <td className="px-5 py-3">
          <StatusBadge status={row.status} />
        </td>
      </tr>
    ));
  })();

  const showFooter = search.status === "success";
  const displayedResultCount = search.status === "success" ? resultCount : 0;

  return (
    <div
      className="w-full mx-auto mt-4 overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl"
      style={{ maxWidth: TABLE_MAX_WIDTH }}
    >
      {/* Header — title on the left, rows-per-page + result count in the upper right */}
      <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-8 sm:py-6">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Results &middot; Public Portal
          </span>
          <h2 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">
            Applications
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
            {displayedResultCount} result{displayedResultCount === 1 ? "" : "s"}
          </span>
          <PageSizeControl
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Accent bar — navy/gold/red split */}
      <div className="flex h-2.5 w-full">
        <div className="flex-1" style={{ backgroundColor: "#1e3a5f" }} />
        <div className="w-16" style={{ backgroundColor: "#f5b012" }} />
        <div className="w-10" style={{ backgroundColor: "#e0263a" }} />
      </div>

      {/* Table — header row always renders, only the body swaps state */}
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="text-left">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="border-b-2 bg-gray-50/90 px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 backdrop-blur-sm whitespace-nowrap"
                  style={{ borderBottomColor: "#e5e7eb" }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{tableBody}</tbody>
        </table>
      </div>

      {/* Pagination */}
      {showFooter && (
        <PaginationBar
          page={page}
          totalRows={resultCount}
          totalPages={totalPages}
          startRow={startRow}
          endRow={endRow}
          onPageChange={(next) =>
            setPage(Math.max(1, Math.min(next, totalPages)))
          }
        />
      )}

      {/* New: profile modal, opened by clicking a row */}
      <StatusModalProfile
        open={selectedApplicant !== null}
        onClose={() => setSelectedApplicant(null)}
        applicantId={selectedApplicant?.id ?? null}
        applicationType={selectedApplicant?.type ?? null}
      />
    </div>
  );
}
