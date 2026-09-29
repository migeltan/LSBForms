import { useMemo, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";

export interface AdminColumn<T> {
  header: string;
  render: (row: T, index: number) => ReactNode;
  align?: "left" | "center";
  className?: string;
  /** Mobile card role. Default: shown as a label/value field. */
  mobile?: "title" | "badge" | "hide";
}

interface AdminTableShellProps<T> {
  tableNumber: string;
  title: string;
  accent: "red" | "yellow";
  icon: ReactNode;
  columns: AdminColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  searchText: (row: T) => string;
  onRowClick: (row: T) => void;
  loading: boolean;
  error: string | null;
  emptyMessage?: string;
}

const ACCENTS = {
  red: { bg: "var(--smart-red, #ef3b4c)", ink: "#ffffff" },
  yellow: { bg: "var(--smart-yellow, #f5b400)", ink: "#1a1a1a" },
} as const;

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function AdminTableShell<T>({
  tableNumber,
  title,
  accent,
  icon,
  columns,
  rows,
  rowKey,
  searchText,
  onRowClick,
  loading,
  error,
  emptyMessage = "No applications found.",
}: AdminTableShellProps<T>) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => searchText(row).toLowerCase().includes(q));
  }, [rows, query, searchText]);

  const colors = ACCENTS[accent];
  const accentVars = {
    "--accent": colors.bg,
    "--accent-ink": colors.ink,
  } as CSSProperties;

  const hasData = !loading && !error && rows.length > 0;
  const noResults = hasData && filtered.length === 0;

  function handleKey(e: KeyboardEvent, row: T) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRowClick(row);
    }
  }

  const mobileTitle = columns.find((c) => c.mobile === "title");
  const mobileBadge = columns.find((c) => c.mobile === "badge");
  const mobileFields = columns.filter((c) => !c.mobile && c.header !== "No.");

  return (
    <section
      style={accentVars}
      className="rounded-xl bg-white p-5 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
    >
      {/* Heading row */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-[var(--smart-border)] pb-4">
        <div>
          <div
            className="mb-1 text-sm font-bold uppercase tracking-wide"
            style={{
              color: "var(--accent)",
              fontFamily: "var(--smart-font-serif)",
            }}
          >
            Table {tableNumber}
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--accent)] text-[var(--accent-ink)]">
              {icon}
            </span>
            <h2
              className="mb-0! text-2xl font-bold leading-tight text-black! sm:text-3xl"
              style={{ fontFamily: "var(--smart-font-sans)" }}
            >
              {title}
            </h2>
          </div>
        </div>

        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search applications</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--smart-muted)]">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by App. ID, Name, etc..."
            className="w-full rounded-md border border-[var(--smart-border)] bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
          />
        </label>
      </div>

      {/* Desktop / tablet table */}
      <div className="mt-6 hidden max-h-[28rem] overflow-auto rounded-lg border border-[var(--smart-border)] sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.header}
                  className={`sticky top-0 z-10 bg-[var(--accent)] px-4 py-3 font-semibold text-[var(--accent-ink)] ${
                    col.align === "center" ? "text-center" : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, r) => (
                <tr
                  key={`sk-${r}`}
                  className="border-t border-[var(--smart-border)]"
                >
                  {columns.map((col) => (
                    <td key={col.header} className="px-4 py-3">
                      <div className="h-4 w-full max-w-[9rem] animate-pulse rounded bg-black/10" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && error && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-sm text-[var(--smart-red)]"
                >
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-sm text-[var(--smart-muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

            {noResults && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-sm text-[var(--smart-muted)]"
                >
                  No results for &ldquo;{query.trim()}&rdquo;.
                </td>
              </tr>
            )}

            {hasData &&
              filtered.map((row, i) => (
                <tr
                  key={rowKey(row)}
                  tabIndex={0}
                  onClick={() => onRowClick(row)}
                  onKeyDown={(e) => handleKey(e, row)}
                  className={`cursor-pointer border-t border-[var(--smart-border)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent)] ${
                    i % 2 === 1 ? "bg-black/[0.02]" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.header}
                      className={`px-4 py-3 ${
                        col.align === "center" ? "text-center" : "text-left"
                      } ${col.className ?? ""}`}
                    >
                      {col.render(row, i)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-6 sm:hidden">
        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, r) => (
              <div
                key={`msk-${r}`}
                className="h-24 animate-pulse rounded-lg bg-black/10"
              />
            ))}
          </div>
        )}
        {!loading && error && (
          <div className="py-8 text-center text-sm text-[var(--smart-red)]">
            {error}
          </div>
        )}
        {!loading && !error && rows.length === 0 && (
          <div className="py-10 text-center text-sm text-[var(--smart-muted)]">
            {emptyMessage}
          </div>
        )}
        {noResults && (
          <div className="py-10 text-center text-sm text-[var(--smart-muted)]">
            No results for &ldquo;{query.trim()}&rdquo;.
          </div>
        )}
        {hasData && filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtered.map((row, i) => (
              <div
                key={rowKey(row)}
                role="button"
                tabIndex={0}
                onClick={() => onRowClick(row)}
                onKeyDown={(e) => handleKey(e, row)}
                className="cursor-pointer rounded-lg border border-l-4 border-[var(--smart-border)] border-l-[var(--accent)] p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="font-medium">
                    {mobileTitle?.render(row, i)}
                  </span>
                  {mobileBadge?.render(row, i)}
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-[var(--smart-muted)]">
                  {mobileFields.map((col) => (
                    <div key={col.header} className="contents">
                      <dt>{col.header}</dt>
                      <dd className="text-right">{col.render(row, i)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>

      {hasData && (
        <p className="mt-3 text-right text-xs text-[var(--smart-muted)]">
          Showing {filtered.length} of {rows.length}{" "}
          {rows.length === 1 ? "record" : "records"}
        </p>
      )}
    </section>
  );
}
