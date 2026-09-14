import { useEffect, useState } from "react";
import { fetchStatusApplicantProfile } from "../../../api/client"; // adjust path to your client.ts
import type { StatusModalProfileData } from "../../../hooks/types"; // adjust path to your types file
import { CloseButton } from "../../../components/buttons/CloseButton"; // adjust path to your components dir

interface StatusModalProfileProps {
  open: boolean;
  onClose: () => void;
  applicantId: number | string | null;
  applicationType: "access-pass" | "vehicle-sticker" | null;
}

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
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${style.bg} ${style.text}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: style.dot }}
      />
      {status}
    </span>
  );
}

function initials(name: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ---------------------------------------------------------------------
 * Small line icons for each detail field.
 * ------------------------------------------------------------------- */
const FieldIcon = {
  calendar: (
    <path d="M8 2v3M16 2v3M3.5 8h17M5 4h14a1.5 1.5 0 011.5 1.5V19a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 19V5.5A1.5 1.5 0 015 4z" />
  ),
  check: <path d="M4 12l6 6L20 6" />,
  card: (
    <path d="M3.5 6h17A1.5 1.5 0 0122 7.5v9a1.5 1.5 0 01-1.5 1.5h-17A1.5 1.5 0 012 16.5v-9A1.5 1.5 0 013.5 6zM2 10h20" />
  ),
  car: (
    <path d="M4 16.5V13l1.6-4.8A2 2 0 017.5 7h9a2 2 0 011.9 1.2L20 13v3.5M4 16.5a1.5 1.5 0 003 0M17 16.5a1.5 1.5 0 003 0M4 16.5h16M6.5 13h11" />
  ),
  user: <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" />,
  mail: (
    <path d="M3 6.5h18v11a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.5v-11zM3 7l9 6 9-6" />
  ),
  phone: (
    <path d="M6.5 3h3l1.5 4-2 1.5a11 11 0 005 5l1.5-2 4 1.5v3a1.5 1.5 0 01-1.6 1.5A17.5 17.5 0 015 4.6 1.5 1.5 0 016.5 3z" />
  ),
} as const;

/* ---------------------------------------------------------------------
 * Icon-chip color themes — white card background, bold colored border
 * (blue / gold / red), and a solid, strongly-colored icon chip so the
 * color reads clearly against the white card instead of a soft tint.
 * ------------------------------------------------------------------- */
const CARD_THEMES = {
  blue: {
    chipBg: "#60a5fa",
    iconColor: "#ffffff",
    cardBorder: "#93c5fd",
    cardBg: "#ffffff",
    shadow: "rgba(96,165,250,0.35)",
  },
  gold: {
    chipBg: "#fbbf24",
    iconColor: "#ffffff",
    cardBorder: "#fde08a",
    cardBg: "#ffffff",
    shadow: "rgba(251,191,36,0.35)",
  },
  red: {
    chipBg: "#f87171",
    iconColor: "#ffffff",
    cardBorder: "#fca5a5",
    cardBg: "#ffffff",
    shadow: "rgba(248,113,113,0.35)",
  },
} as const;

function DetailCard({
  icon,
  label,
  value,
  theme,
}: {
  icon: keyof typeof FieldIcon;
  label: string;
  value: string | null;
  theme: keyof typeof CARD_THEMES;
}) {
  const hasValue = value != null && value.trim() !== "";
  const t = CARD_THEMES[theme];
  return (
    <div
      className="flex items-start gap-3 rounded-xl border px-4 py-3 transition-transform hover:-translate-y-0.5"
      style={{
        backgroundColor: t.cardBg,
        borderColor: t.cardBorder,
        boxShadow: `0 4px 10px -2px ${t.shadow}`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-lg h-9 w-9 shrink-0"
        style={{ backgroundColor: t.chipBg, color: t.iconColor }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4.5 w-4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {FieldIcon[icon]}
        </svg>
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
          {label}
        </div>
        <div
          className={`mt-0.5 truncate text-sm font-semibold ${
            hasValue ? "text-gray-800" : "text-gray-400"
          }`}
        >
          {hasValue ? value : "—"}
        </div>
      </div>
    </div>
  );
}

export function StatusModalProfile({
  open,
  onClose,
  applicantId,
  applicationType,
}: StatusModalProfileProps) {
  const [data, setData] = useState<StatusModalProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || applicantId == null || !applicationType) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    fetchStatusApplicantProfile(applicantId, applicationType)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load this applicant's profile.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, applicantId, applicationType]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Body scroll lock — freezes the page underneath while the modal is
  // open. Restores whatever the previous overflow value was on
  // close/unmount rather than assuming it was "".
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-[fadeIn_150ms_ease-out]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white animate-[scaleIn_180ms_ease-out]"
        style={{
          boxShadow:
            "0 0 0 1px rgba(30,58,95,0.08), 0 20px 25px -5px rgba(15,39,68,0.18), 0 8px 10px -6px rgba(15,39,68,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Applicant profile"
      >
        {/* Accent bar — matches the results table */}
        <div className="flex w-full h-3.5 shrink-0 overflow-hidden">
          <div
            className="flex-1"
            style={{
              background: "linear-gradient(90deg, #14284a 0%, #2a5089 100%)",
            }}
          />
          <div
            className="w-16"
            style={{
              background: "linear-gradient(90deg, #f5b012 0%, #ffd166 100%)",
            }}
          />
          <div
            className="w-10"
            style={{
              background: "linear-gradient(90deg, #e0263a 0%, #c11a2c 100%)",
            }}
          />
        </div>

        {/* Header band — layered navy gradient with soft accent glows */}
        <div
          className="relative px-6 pb-10 overflow-hidden pt-7 sm:px-9 sm:pt-9"
          style={{
            background:
              "linear-gradient(160deg, #eaf0f8 0%, #f8fafc 55%, #ffffff 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full opacity-[0.07]"
            style={{ background: "#1e3a5f" }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-4 top-20 h-24 w-24 rounded-full opacity-[0.08]"
            style={{ background: "#e0263a" }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-1/3 -top-6 h-16 w-16 rounded-full opacity-[0.06]"
            style={{ background: "#f5b012" }}
            aria-hidden="true"
          />

          <div className="relative flex items-start justify-between gap-4">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase"
              style={{ color: "#1e3a5f" }}
            >
              <span
                className="h-1.5 w-4 rounded-full"
                style={{ backgroundColor: "#f5b012" }}
              />
              Applicant Profile
            </span>
            <CloseButton onClick={onClose} />
          </div>

          {loading && (
            <div className="relative flex flex-col items-center gap-3 py-16">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#1e3a5f]" />
              <span className="text-sm text-gray-500">Loading profile…</span>
            </div>
          )}

          {!loading && error && (
            <div className="relative py-16 text-sm font-medium text-center text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && data && (
            <div
              className="relative flex items-center gap-5 p-4 border mt-7 rounded-2xl border-white/60 bg-white/60 backdrop-blur-sm sm:p-5"
              style={{
                boxShadow: "0 8px 24px -12px rgba(15,39,68,0.18)",
              }}
            >
              {data.photo_path ? (
                <img
                  src={data.photo_path}
                  alt={data.full_name ?? "Applicant photo"}
                  className="object-cover w-20 h-20 rounded-full ring-4 ring-white sm:h-24 sm:w-24"
                  style={{ boxShadow: "0 6px 16px -4px rgba(15,39,68,0.35)" }}
                />
              ) : (
                <div
                  className="flex items-center justify-center w-20 h-20 text-2xl font-bold text-white rounded-full ring-4 ring-white sm:h-24 sm:w-24 sm:text-3xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #2a5089 0%, #14284a 100%)",
                    boxShadow: "0 6px 16px -4px rgba(15,39,68,0.35)",
                  }}
                >
                  {initials(data.full_name)}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xl font-bold tracking-tight text-gray-900 truncate sm:text-2xl">
                  {data.full_name ?? "—"}
                </div>
                <div
                  className="inline-block mt-1.5 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide"
                  style={{ backgroundColor: "#eef3f9", color: "#1e3a5f" }}
                >
                  {data.application_id}
                </div>
                <div className="mt-2.5">
                  <StatusBadge status={data.status} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detail grid — cards cycle through blue / gold / red themes */}
        {!loading && !error && data && (
          <div className="grid grid-cols-1 gap-3.5 px-6 py-7 sm:grid-cols-2 sm:px-9">
            <DetailCard
              icon="calendar"
              label="Date submitted"
              value={formatDate(data.date_submitted)}
              theme="blue"
            />
            <DetailCard
              icon="check"
              label="Date reviewed"
              value={formatDate(data.date_reviewed)}
              theme="gold"
            />
            {data.application_type === "access-pass" ? (
              <DetailCard
                icon="card"
                label="Application type"
                value={data.applicant_type}
                theme="red"
              />
            ) : (
              <DetailCard
                icon="car"
                label="Plate number"
                value={data.plate_number}
                theme="red"
              />
            )}
            <DetailCard icon="user" label="Sex" value={data.sex} theme="blue" />
            <DetailCard
              icon="mail"
              label="Email"
              value={data.email}
              theme="gold"
            />
            <DetailCard
              icon="phone"
              label="Contact number"
              value={data.contact_number}
              theme="red"
            />
          </div>
        )}
      </div>
    </div>
  );
}
