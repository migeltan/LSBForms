import { useEffect, useState } from "react";
import type { VehicleStickerRow } from "../../../../hooks/types";
import { StatusBadge } from "../StatusBadge";
import { VehicleDetailModal } from "./VehicleDetailModal";
import { TOKEN_KEY } from "../../../../providers/AuthProvider";

const ENDPOINT = "http://localhost:8000/api/admin/vehicle-sticker";

function PentagonCorner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <polygon
        points="100,4 190,72 155,180 45,180 10,72"
        fill="var(--smart-yellow, #d4a017)"
        opacity="0.09"
      />
    </svg>
  );
}

function FoldedCornerYellow() {
  return (
    <div
      aria-hidden="true"
      className="absolute top-0 right-0 w-8 h-8 pointer-events-none"
      style={{
        clipPath: "polygon(100% 0, 0 0, 100% 100%)",
        background: "var(--smart-yellow, #d4a017)",
      }}
    />
  );
}

export function VehicleStickerTable() {
  const [rows, setRows] = useState<VehicleStickerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState<number | null>(
    null
  );

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
    <div className="form-section-card relative overflow-hidden">
      <FoldedCornerYellow />
      {/* Translucent pentagon accents, corners only, sit behind all content */}
      <PentagonCorner className="w-40 h-40 -top-10 -right-10 rotate-12" />
      <PentagonCorner className="w-28 h-28 -bottom-8 -left-8 -rotate-12" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-1 pb-4 border-b border-[var(--smart-border)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--smart-yellow,#d4a017)]/10 text-[var(--smart-yellow,#d4a017)]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 13l2-6a2 2 0 0 1 2-1.4h10a2 2 0 0 1 2 1.4l2 6" />
                <path d="M3 13h18v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4Z" />
                <circle cx="7.5" cy="15.5" r="0.5" fill="currentColor" />
                <circle cx="16.5" cy="15.5" r="0.5" fill="currentColor" />
              </svg>
            </span>
            <div>
              <div className="section-label mb-0.5">Admin</div>
              <h2 className="mb-0 leading-tight">
                Vehicle Sticker Applications
              </h2>
            </div>
          </div>

          {!loading && !error && rows.length > 0 && (
            <span className="hidden sm:inline-flex items-center rounded-full border border-[var(--smart-border)] px-3 py-1 text-xs font-medium text-[var(--smart-muted)] shrink-0">
              {rows.length} {rows.length === 1 ? "record" : "records"}
            </span>
          )}
        </div>

        {/* Desktop / tablet: table — header always visible, body swaps state */}
        <div className="hidden sm:block overflow-x-auto rounded-lg border border-[var(--smart-border)] mt-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--smart-yellow,#d4a017)] text-gray-900">
                <th className="py-3 px-4 text-left font-medium">
                  Application ID
                </th>
                <th className="py-3 px-4 text-left font-medium">Full Name</th>
                <th className="py-3 px-4 text-left font-medium">
                  Applicant Type
                </th>
                <th className="py-3 px-4 text-left font-medium">
                  Plate Number
                </th>
                <th className="py-3 px-4 text-left font-medium">
                  Date Submitted
                </th>
                <th className="py-3 px-4 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-10">
                    <div className="flex items-center gap-2 justify-center text-[var(--smart-muted)] text-sm">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      Loading applications&hellip;
                    </div>
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-[var(--smart-red)] text-sm"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-[var(--smart-muted)] text-sm"
                  >
                    No applications found.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                rows.map((row, i) => (
                  <tr
                    key={row.application_id}
                    onClick={() => setSelectedApplicantId(row.applicant_id)}
                    className={`cursor-pointer transition-colors hover:bg-[var(--smart-yellow,#d4a017)]/10 ${
                      i % 2 === 1 ? "bg-black/[0.015]" : ""
                    } border-t border-[var(--smart-border)]`}
                  >
                    <td className="py-3 px-4 font-mono text-xs text-[var(--smart-muted)]">
                      {row.application_id}
                    </td>
                    <td className="py-3 px-4 font-medium">{row.full_name}</td>
                    <td className="py-3 px-4 text-[var(--smart-muted)]">
                      {row.applicant_type}
                    </td>
                    <td className="py-3 px-4 text-[var(--smart-muted)]">
                      {row.plate_number}
                    </td>
                    <td className="py-3 px-4 text-[var(--smart-muted)]">
                      {row.date_submitted}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: stacked cards */}
        <div className="sm:hidden mt-4">
          {loading && (
            <div className="flex items-center gap-2 py-10 justify-center text-[var(--smart-muted)] text-sm">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Loading applications&hellip;
            </div>
          )}

          {!loading && error && (
            <div className="py-8 text-center text-[var(--smart-red)] text-sm">
              {error}
            </div>
          )}

          {!loading && !error && rows.length === 0 && (
            <div className="py-10 text-center text-[var(--smart-muted)] text-sm">
              No applications found.
            </div>
          )}

          {!loading && !error && rows.length > 0 && (
            <div className="flex flex-col gap-3">
              {rows.map((row, i) => (
                <div
                  key={row.application_id}
                  onClick={() => setSelectedApplicantId(row.applicant_id)}
                  className="cursor-pointer rounded-lg border border-[var(--smart-border)] p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-medium">
                      {i + 1}. {row.full_name}
                    </span>
                    <StatusBadge status={row.status} />
                  </div>
                  <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-xs text-[var(--smart-muted)]">
                    <dt>Application ID</dt>
                    <dd className="font-mono text-right">
                      {row.application_id}
                    </dd>
                    <dt>Applicant Type</dt>
                    <dd className="text-right">{row.applicant_type}</dd>
                    <dt>Plate Number</dt>
                    <dd className="text-right">{row.plate_number}</dd>
                    <dt>Date Submitted</dt>
                    <dd className="text-right">{row.date_submitted}</dd>
                  </dl>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <VehicleDetailModal
        applicantId={selectedApplicantId}
        onClose={() => setSelectedApplicantId(null)}
      />
    </div>
  );
}
