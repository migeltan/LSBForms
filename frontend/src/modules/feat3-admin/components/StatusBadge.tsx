import type { ApplicationStatus } from "../../../hooks/types";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Submitted: "bg-blue-100 text-blue-800",
  "Incomplete/Returned": "bg-gray-100 text-gray-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  "Under Review": "bg-amber-100 text-amber-800",
  Completed: "bg-emerald-100 text-emerald-800",
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  Submitted: "For Review",
  "Incomplete/Returned": "Incomplete/Returned",
  Approved: "Approved",
  Rejected: "Rejected",
  "Under Review": "Under Review",
  Completed: "Completed",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
