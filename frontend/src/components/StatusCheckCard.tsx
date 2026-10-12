// components/StatusCheckCard.tsx
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { lookupApplicationStatus } from "../api/client";
import type { StatusLookupResult } from "../hooks/types";

/**
 * Landing-page "Check Application Status" card.
 *
 * Everything happens inside this one card — no navigation:
 *   1. User types the reference number and clicks "Check Application".
 *   2. The card EXPANDS and asks for the last name / email (the backend
 *      requires it so a wrong guess never confirms a reference exists).
 *   3. The result is shown in a table inside the same expanded area.
 */

type Phase =
  | { name: "idle" }
  | { name: "verify"; reference: string; error?: string }
  | { name: "loading"; reference: string }
  | { name: "error"; reference: string; message: string }
  | { name: "success"; result: StatusLookupResult };

const TYPE_LABEL: Record<StatusLookupResult["type"], string> = {
  "access-pass": "Access Pass",
  "vehicle-sticker": "Vehicle Sticker",
};

const STATUS_TONE: Record<string, string> = {
  Approved: "ok",
  Completed: "ok",
  Rejected: "bad",
  "Incomplete/Returned": "warn",
  Submitted: "info",
  "Under Review": "info",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-PH", { dateStyle: "long", timeStyle: "short" });
}

export function StatusCheckCard() {
  const [reference, setReference] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [refError, setRefError] = useState<string | null>(null);

  const identifierRef = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();

  const expanded = phase.name !== "idle";

  // Move focus to the verification field when the card expands, and make
  // sure the freshly-opened result area is on screen.
  useEffect(() => {
    if (phase.name === "verify") {
      const t = window.setTimeout(() => {
        identifierRef.current?.focus({ preventScroll: true });
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 250);
      return () => window.clearTimeout(t);
    }
    if (phase.name === "success" || phase.name === "error") {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [phase.name]);

  /** Step 1 — reference number submitted: expand the card. */
  function handleReferenceSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = reference.trim();
    if (!trimmed) {
      setRefError("Please enter your reference number.");
      return;
    }
    setRefError(null);
    setPhase({ name: "verify", reference: trimmed });
  }

  /** Step 2 — verify with last name / email and fetch the result. */
  async function handleVerifySubmit(e: FormEvent) {
    e.preventDefault();
    if (phase.name !== "verify" && phase.name !== "error") return;
    const ref = phase.reference;
    const id = identifier.trim();

    if (!id) {
      setPhase({
        name: "verify",
        reference: ref,
        error: "Enter the last name or email you used when applying.",
      });
      return;
    }

    setPhase({ name: "loading", reference: ref });
    try {
      const result = await lookupApplicationStatus(ref, id);
      setPhase({ name: "success", result });
    } catch (err) {
      let message = "Something went wrong. Please try again.";
      if (axios.isAxiosError(err)) {
        const code = err.response?.status;
        if (code === 429) {
          message = "Too many attempts. Please wait a minute and try again.";
        } else if (code === 404 || code === 422) {
          message =
            err.response?.data?.message ??
            "We couldn't find an application matching those details.";
        }
      }
      setPhase({ name: "error", reference: ref, message });
    }
  }

  function handleClose() {
    setPhase({ name: "idle" });
    setIdentifier("");
    setRefError(null);
  }

  function handleNewSearch() {
    setReference("");
    setIdentifier("");
    setPhase({ name: "idle" });
    setRefError(null);
  }

  const busy = phase.name === "loading";

  return (
    <section
      className={`status-check-card form-section-card landing-card corner-accent-yellow${
        expanded ? " is-expanded" : ""
      }`}
      aria-label="Check application status"
    >
      {/* ---------------- Existing top row (unchanged look) ---------------- */}
      <div className="status-check-text">
        <div className="section-label">Already Applied?</div>
        <h2>Check Application Status</h2>
        <p className="mb-0 text-[var(--smart-muted)]">
          Enter your <strong>application reference number</strong>, then confirm
          it with your <strong>last name or email</strong> to see where your
          application stands.
        </p>
      </div>

      <form
        className="status-check-controls-form"
        onSubmit={handleReferenceSubmit}
        noValidate
      >
        <div className="status-check-controls">
          <div className="status-check-input-wrap">
            <Search
              size={16}
              className="status-check-input-icon"
              aria-hidden="true"
            />
            <input
              type="text"
              value={reference}
              onChange={(e) => {
                setReference(e.target.value);
                if (refError) setRefError(null);
              }}
              placeholder="Search Reference..."
              aria-label="Application reference number"
              aria-invalid={refError ? true : undefined}
              aria-expanded={expanded}
              aria-controls={panelId}
              autoComplete="off"
              disabled={busy}
            />
          </div>
          <button type="submit" className="btn btn-govt-info" disabled={busy}>
            Check Application
          </button>
        </div>
        {refError && (
          <p className="status-inline-error" role="alert">
            {refError}
          </p>
        )}
      </form>

      {/* ---------------- Expanding result area ---------------- */}
      <div
        id={panelId}
        className={`status-expand${expanded ? " is-open" : ""}`}
        aria-hidden={!expanded}
        {...(!expanded ? ({ inert: true } as object) : {})}
      >
        <div className="status-expand__clip">
          <div className="status-expand__body" ref={resultsRef} aria-live="polite">
            {/* Close button */}
            <button
              type="button"
              className="status-expand__close"
              onClick={handleClose}
              aria-label="Close results"
            >
              <X size={18} aria-hidden="true" />
            </button>

            {/* ----- Step 2: verify ----- */}
            {(phase.name === "verify" ||
              phase.name === "loading" ||
              phase.name === "error") && (
              <form
                className="status-verify"
                onSubmit={handleVerifySubmit}
                noValidate
              >
                <div className="status-verify__head">
                  <span className="status-verify__icon" aria-hidden="true">
                    <ShieldCheck size={20} />
                  </span>
                  <div>
                    <h3 className="status-verify__title">
                      Confirm it&apos;s your application
                    </h3>
                    <p className="status-verify__sub">
                      Reference number{" "}
                      <strong className="status-ref-chip">
                        {phase.name === "verify" ||
                        phase.name === "loading" ||
                        phase.name === "error"
                          ? phase.reference
                          : ""}
                      </strong>
                      . Enter the <strong>last name or email</strong> you used
                      when applying.
                    </p>
                  </div>
                </div>

                <div className="status-verify__row">
                  <input
                    ref={identifierRef}
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Dela Cruz  or  juan@email.com"
                    aria-label="Last name or email"
                    autoComplete="off"
                    disabled={busy}
                    className="status-verify__input"
                  />
                  <button
                    type="submit"
                    className="btn btn-govt-primary status-verify__btn"
                    disabled={busy}
                  >
                    {busy ? (
                      <>
                        <Loader2
                          size={16}
                          className="status-spin"
                          aria-hidden="true"
                        />
                        Checking…
                      </>
                    ) : (
                      "Check Status"
                    )}
                  </button>
                </div>

                {phase.name === "verify" && phase.error && (
                  <div className="status-alert" role="alert">
                    <AlertCircle size={18} aria-hidden="true" />
                    <span>{phase.error}</span>
                  </div>
                )}
                {phase.name === "error" && (
                  <div className="status-alert" role="alert">
                    <AlertCircle size={18} aria-hidden="true" />
                    <span>{phase.message}</span>
                  </div>
                )}
              </form>
            )}

            {/* ----- Result table ----- */}
            {phase.name === "success" && (
              <div className="status-result">
                <div className="status-result__head">
                  <span className="status-result__ok" aria-hidden="true">
                    <CheckCircle2 size={20} />
                  </span>
                  <div>
                    <h3 className="status-verify__title">Application found</h3>
                    <p className="status-verify__sub">
                      Here is the latest status of your application.
                    </p>
                  </div>
                </div>

                <div className="status-table-wrap">
                  <table className="status-table">
                    <caption className="sr-only">
                      Application status result
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Application Type</th>
                        <th scope="col">Reference No.</th>
                        <th scope="col">Status</th>
                        <th scope="col">Date Submitted</th>
                        <th scope="col">Date Reviewed</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td data-label="Application Type">
                          {TYPE_LABEL[phase.result.type] ?? phase.result.type}
                        </td>
                        <td data-label="Reference No." className="is-ref">
                          {phase.result.application_id}
                        </td>
                        <td data-label="Status">
                          <span
                            className={`status-pill status-pill--${
                              STATUS_TONE[phase.result.status] ?? "neutral"
                            }`}
                          >
                            <span className="status-pill__dot" />
                            {phase.result.status}
                          </span>
                        </td>
                        <td data-label="Date Submitted">
                          {formatDate(phase.result.date_submitted)}
                        </td>
                        <td data-label="Date Reviewed">
                          {phase.result.date_reviewed
                            ? formatDate(phase.result.date_reviewed)
                            : "Not yet reviewed"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="status-result__actions">
                  <button
                    type="button"
                    className="status-link-btn"
                    onClick={handleNewSearch}
                  >
                    <RotateCcw size={15} aria-hidden="true" />
                    Search another reference
                  </button>
                  <button
                    type="button"
                    className="status-link-btn"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
