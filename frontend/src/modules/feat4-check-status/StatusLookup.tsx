import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { lookupApplicationStatus } from "../../api/client";
import type { StatusLookupResult } from "../../hooks/types";

type LookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; result: StatusLookupResult };

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
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold ${style.bg} ${style.text}`}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: style.dot }}
      />
      {status}
    </span>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-PH", { dateStyle: "long", timeStyle: "short" });
}

const INPUT_CLASS =
  "w-full px-3 py-2 text-sm bg-white border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30";
const LABEL_CLASS =
  "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-blue-700";

export function StatusLookup() {
  // The landing page's "Check Application Status" card links here with ?ref=.
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(
    () => searchParams.get("ref") ?? "",
  );
  const [identifier, setIdentifier] = useState("");
  const [state, setState] = useState<LookupState>({ status: "idle" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!reference.trim() || !identifier.trim()) {
      setState({
        status: "error",
        message:
          "Enter both your reference number and your last name or email.",
      });
      return;
    }

    setState({ status: "loading" });
    try {
      const result = await lookupApplicationStatus(
        reference.trim(),
        identifier.trim(),
      );
      setState({ status: "success", result });
    } catch (err) {
      let message = "Something went wrong. Please try again.";
      if (axios.isAxiosError(err)) {
        const code = err.response?.status;
        if (code === 429) {
          message = "Too many attempts. Please wait a minute and try again.";
        } else if (code === 404 || code === 422) {
          message = err.response?.data?.message ?? message;
        }
      }
      setState({ status: "error", message });
    }
  }

  const typeLabel =
    state.status === "success"
      ? state.result.type === "vehicle-sticker"
        ? "Vehicle Sticker"
        : "Access Pass"
      : "";

  return (
    <div
      className="mx-auto w-full max-w-xl rounded-xl p-[1.5px] shadow-[0_25px_70px_-20px_rgba(15,39,68,0.35)]"
      style={{
        background:
          "linear-gradient(135deg, rgba(30,58,95,0.8) 0%, rgba(15,39,68,0.2) 45%, rgba(30,58,95,0.8) 100%)",
      }}
    >
      <div className="overflow-hidden rounded-[11px] bg-white ring-1 ring-black/5">
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
              Application Status &middot; Public Portal
            </div>
            <h2
              className="text-lg font-bold sm:text-xl"
              style={{ color: "#ffffff" }}
            >
              Check Your Application
            </h2>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 px-5 py-5 bg-gray-50/40 sm:px-8 sm:py-6"
        >
          <p className="text-sm text-[var(--smart-muted)]">
            Enter your <strong>reference number</strong> and the{" "}
            <strong>last name or email</strong> you used when applying. Lost
            your reference number? Please contact the office.
          </p>

          <div>
            <label htmlFor="status-reference" className={LABEL_CLASS}>
              Reference Number
            </label>
            <input
              id="status-reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="AP-2026-00001"
              autoComplete="off"
              className={INPUT_CLASS}
              style={{ boxShadow: "none" }}
            />
          </div>

          <div>
            <label htmlFor="status-identifier" className={LABEL_CLASS}>
              Last Name or Email
            </label>
            <input
              id="status-identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Dela Cruz  or  juan@email.com"
              autoComplete="off"
              className={INPUT_CLASS}
              style={{ boxShadow: "none" }}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={state.status === "loading"}
              className="w-full btn btn-govt-primary sm:w-auto disabled:opacity-60"
            >
              {state.status === "loading" ? "Checking…" : "Check Status"}
            </button>
          </div>

          {state.status === "error" && (
            <div
              role="alert"
              className="px-4 py-3 text-sm text-red-800 border border-red-200 rounded-md bg-red-50"
            >
              {state.message}
            </div>
          )}
        </form>

        {state.status === "success" && (
          <div className="px-5 py-5 border-t border-gray-200 sm:px-8 sm:py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {typeLabel}
                </div>
                <div className="text-lg font-bold text-[#1f3a6b]">
                  {state.result.application_id}
                </div>
              </div>
              <StatusBadge status={state.result.status} />
            </div>

            <dl className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Date Submitted
                </dt>
                <dd className="mt-1 text-sm font-semibold text-gray-800">
                  {formatDate(state.result.date_submitted)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Date Reviewed
                </dt>
                <dd className="mt-1 text-sm font-semibold text-gray-800">
                  {state.result.date_reviewed
                    ? formatDate(state.result.date_reviewed)
                    : "Not yet reviewed"}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
