import type { ReactNode } from "react";
import { Printer } from "lucide-react";

export function BatchBar({
  label,
  hint,
  eligibleCount,
  selectedCount,
  max,
  selecting,
  onStart,
  onCancel,
  busy,
  busyText,
  actionLabel,
  actionIcon,
  onAction,
  onSelectAll,
  error,
  notice,
  children,
}: {
  label: string;
  hint: string;
  eligibleCount: number;
  selectedCount: number;
  max: number;
  selecting: boolean;
  onStart: () => void;
  onCancel: () => void;
  busy: boolean;
  busyText: string;
  actionLabel: string;
  actionIcon: ReactNode;
  onAction: () => void;
  onSelectAll: () => void;
  error: string | null;
  notice: string | null;
  children?: ReactNode;
}) {
  if (!selecting) {
    return (
      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        {error && (
          <span className="text-xs text-[var(--smart-red)]">{error}</span>
        )}
        {notice && !error && (
          <span className="text-xs text-emerald-700">{notice}</span>
        )}
        <button
          type="button"
          onClick={onStart}
          disabled={eligibleCount === 0}
          title={
            eligibleCount === 0
              ? "No approved applications to print yet"
              : "Choose approved applications to print together"
          }
          className="inline-flex items-center gap-2 rounded-lg border border-[#15304f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#15304f] shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          {label}
        </button>
      </div>
    );
  }

  const tooMany = selectedCount > max;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-4 rounded-xl border border-[#15304f]/30 bg-[#15304f]/[0.05] px-4 py-3 text-sm"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#15304f] text-white">
          <Printer className="h-5 w-5" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1 basis-64">
          <div className="flex flex-wrap items-center gap-2 font-semibold text-gray-900">
            {label}
            <span className="rounded-full bg-[#15304f] px-2.5 py-0.5 text-xs font-semibold text-white">
              {selectedCount} selected
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[var(--smart-muted)]">{hint}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedCount < eligibleCount && (
            <button
              type="button"
              onClick={onSelectAll}
              disabled={busy}
              className="rounded-lg border border-[#15304f]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#15304f] transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Select all approved ({eligibleCount})
            </button>
          )}
          {children}
          <button
            type="button"
            onClick={onAction}
            disabled={busy || tooMany || selectedCount === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-[#15304f] px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f2744] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              actionIcon
            )}
            {busy ? "Generating…" : actionLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-black/5 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>

      {(busy || tooMany || error || notice) && (
        <div className="mt-2 border-t border-[var(--smart-border)] pt-2 text-xs">
          {busy && (
            <span className="text-[var(--smart-muted)]">{busyText}</span>
          )}
          {tooMany && (
            <span className="text-[var(--smart-red)]">
              Max {max} per batch. Deselect {selectedCount - max}.
            </span>
          )}
          {error && <span className="text-[var(--smart-red)]">{error}</span>}
          {notice && !error && !busy && (
            <span className="text-emerald-700">{notice}</span>
          )}
        </div>
      )}
    </div>
  );
}
