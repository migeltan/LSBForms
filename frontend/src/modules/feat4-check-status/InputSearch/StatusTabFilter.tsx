import { type FormEvent } from "react";
import { CustomCalendarInput } from "../../../components/ui/CustomCalendarInput";

/* ---------------------------------------------------------------------
 * Change these to resize the whole filter card. Plain values applied
 * via inline style (not Tailwind classes) so any CSS length works.
 * ------------------------------------------------------------------- */
const FILTER_TAB_MAX_WIDTH = "1500px"; // e.g. "1200px", "90rem", "100%"
const FILTER_TAB_MIN_HEIGHT = "auto"; // e.g. "auto", "600px"

export type StatusTypeFilter = "" | "access-pass" | "vehicle-sticker";
export type StatusStatusFilter =
  | ""
  | "Submitted"
  | "Under Review"
  | "Incomplete/Returned"
  | "Approved"
  | "Rejected"
  | "Completed";

interface StatusTabFilterProps {
  name: string;
  onNameChange: (value: string) => void;

  applicationId: string;
  onApplicationIdChange: (value: string) => void;

  typeFilter: StatusTypeFilter;
  onTypeFilterChange: (value: StatusTypeFilter) => void;

  dateFilter: string;
  onDateFilterChange: (value: string) => void;

  statusFilter: StatusStatusFilter;
  onStatusFilterChange: (value: StatusStatusFilter) => void;

  onSubmit: (e: FormEvent) => void;
}

/* ---------------------------------------------------------------------
 * A colored badge label, matching the tab-highlight treatment used in
 * ApplicantDetailModal.
 * ------------------------------------------------------------------- */
function SectionBadge({
  color,
  children,
}: {
  color: "blue" | "gold" | "red";
  children: React.ReactNode;
}) {
  const styles = {
    blue: "bg-blue-500/10 text-blue-800 ring-1 ring-blue-500/30",
    gold: "bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/30",
    red: "bg-red-500/10 text-red-800 ring-1 ring-red-500/30",
  }[color];
  return (
    <span
      className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${styles}`}
    >
      {children}
    </span>
  );
}

const STATUS_OPTIONS: StatusStatusFilter[] = [
  "Submitted",
  "Under Review",
  "Incomplete/Returned",
  "Approved",
  "Rejected",
  "Completed",
];

export function StatusTabFilter({
  name,
  onNameChange,
  applicationId,
  onApplicationIdChange,
  typeFilter,
  onTypeFilterChange,
  dateFilter,
  onDateFilterChange,
  statusFilter,
  onStatusFilterChange,
  onSubmit,
}: StatusTabFilterProps) {
  function handleClear() {
    onNameChange("");
    onApplicationIdChange("");
    onTypeFilterChange("");
    onDateFilterChange("");
    onStatusFilterChange("");
  }

  return (
    <div
      className="mx-auto w-full rounded-xl p-[1.5px] shadow-[0_25px_70px_-20px_rgba(15,39,68,0.35)]"
      style={{
        maxWidth: FILTER_TAB_MAX_WIDTH,
        minHeight: FILTER_TAB_MIN_HEIGHT,
        background:
          "linear-gradient(135deg, rgba(30,58,95,0.8) 0%, rgba(15,39,68,0.2) 45%, rgba(30,58,95,0.8) 100%)",
      }}
    >
      <div className="overflow-hidden rounded-[11px] bg-white ring-1 ring-black/5">
        {/* Header — navy gradient with diagonal gold/red accent */}
        <div
          className="relative px-5 py-4 overflow-hidden text-white sm:px-8 sm:py-5"
          style={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)",
          }}
        >
          <div
            className="absolute inset-y-0 right-0 w-32 pointer-events-none sm:w-56"
            aria-hidden="true"
          >
            <div
              className="absolute inset-y-0 w-8 right-6 sm:right-12 sm:w-14"
              style={{ background: "#e0263a", transform: "skewX(-16deg)" }}
            />
            <div
              className="absolute inset-y-0 right-0 w-8 sm:w-14"
              style={{ background: "#f5b012", transform: "skewX(-16deg)" }}
            />
          </div>

          <div className="relative flex flex-col gap-1">
            <div
              className="text-xs font-bold uppercase tracking-wider text-[#f5b012]"
              style={{ letterSpacing: "0.06em" }}
            >
              Application Lookup &middot; Public Portal
            </div>
            <h2
              className="text-lg font-bold sm:text-xl"
              style={{ color: "#ffffff" }}
            >
              Search Applications
            </h2>
          </div>
        </div>

        {/* Single form wraps everything — one submit button at the end */}
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 px-5 py-5 bg-gray-50/40 sm:px-8 sm:py-6"
        >
          {/* Search fields + Filters side-by-side on wider screens — wider, not taller */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {/* Search fields */}
            <div className="px-5 py-4 border border-blue-100 rounded-lg shadow-sm bg-blue-50/40 lg:col-span-2">
              <SectionBadge color="blue">Search By</SectionBadge>
              <p className="mt-2 text-sm text-[var(--smart-muted)]">
                Enter a name, an application ID, or both — either is enough to
                search.
              </p>

              <div className="grid grid-cols-1 gap-3 mt-3 sm:grid-cols-[3fr_2fr] lg:grid-cols-1 xl:grid-cols-[3fr_2fr]">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                    Applicant Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className="w-full px-3 py-2 text-sm bg-white border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    style={{ boxShadow: "none" }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                    Application ID
                  </label>
                  <input
                    type="text"
                    value={applicationId}
                    onChange={(e) => onApplicationIdChange(e.target.value)}
                    placeholder="AP-2026-00001"
                    className="w-full px-3 py-2 text-sm bg-white border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    style={{ boxShadow: "none" }}
                  />
                </div>
              </div>
            </div>

            {/* Filters — three theme-colored panels, each independent */}
            <div className="px-5 py-4 border border-red-100 rounded-lg shadow-sm bg-red-50/40 lg:col-span-3">
              <SectionBadge color="red">Filters</SectionBadge>
              <p className="mt-2 text-sm text-[var(--smart-muted)]">
                Apply any of these on their own, or combine them with the search
                fields above.
              </p>

              <div className="grid grid-cols-1 gap-3 mt-3 sm:grid-cols-3">
                {/* Type — blue */}
                <div className="px-3 py-3 border border-blue-100 rounded-lg bg-blue-50/50">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                    Application Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) =>
                      onTypeFilterChange(e.target.value as StatusTypeFilter)
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    style={{ boxShadow: "none" }}
                  >
                    <option value="">All Types</option>
                    <option value="access-pass">Access Pass</option>
                    <option value="vehicle-sticker">Vehicle Sticker</option>
                  </select>
                </div>

                {/* Date — gold */}
                <div className="px-3 py-3 border rounded-lg border-amber-100 bg-amber-50/50">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                    Date Submitted
                  </label>
                  <CustomCalendarInput
                    value={dateFilter}
                    onChange={onDateFilterChange}
                    color="amber"
                  />
                </div>

                {/* Status — red */}
                <div className="px-3 py-3 border border-red-100 rounded-lg bg-red-50/50">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-red-700">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      onStatusFilterChange(e.target.value as StatusStatusFilter)
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/30"
                    style={{ boxShadow: "none" }}
                  >
                    <option value="">Any Status</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Clear + Search */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="w-full rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 sm:w-auto"
            >
              Clear
            </button>
            <button
              type="submit"
              className="w-full btn btn-govt-primary sm:w-auto"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
