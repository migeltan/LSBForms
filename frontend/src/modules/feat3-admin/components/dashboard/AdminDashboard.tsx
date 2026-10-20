import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock3, RefreshCw } from "lucide-react";
import type { ApplicationStatus } from "../../../../hooks/types";
import {
  STATUS_ORDER,
  useDashboardStats,
  type FormStats,
  type TrendPoint,
} from "../../hooks/useDashboardStats";
import "../../../../styles/admin-dashboard.css";

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */
const STATUS_LABEL: Record<ApplicationStatus, string> = {
  Submitted: "For Review",
  "Under Review": "Under Review",
  "Incomplete/Returned": "Incomplete/Returned",
  Approved: "Approved",
  Completed: "Completed",
  Rejected: "Rejected",
};

const STATUS_CLASS: Record<ApplicationStatus, string> = {
  Submitted: "submitted",
  "Under Review": "review",
  "Incomplete/Returned": "returned",
  Approved: "approved",
  Completed: "completed",
  Rejected: "rejected",
};

const pct = (n: number, total: number) =>
  total > 0 ? Math.round((n / total) * 100) : 0;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Counts up from 0 once, then eases to new values on refresh. */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const reduce = prefersReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduce]);

  return reduce ? target : value;
}

function CountUp({ value }: { value: number }) {
  const v = useCountUp(value);
  return <>{v.toLocaleString()}</>;
}

const delay = (i: number): CSSProperties => ({
  ["--ad-delay" as string]: `${i * 70}ms`,
});

/* ------------------------------------------------------------------ *
 * Application panel (Access Pass / Vehicle Sticker)
 * Banner, status breakdown and the link to the full table in one card.
 * ------------------------------------------------------------------ */
function AppPanel({
  tone,
  title,
  description,
  stats,
  onOpen,
  index,
}: {
  tone: "red" | "yellow";
  title: string;
  description: string;
  stats: FormStats;
  onOpen: () => void;
  index: number;
}) {
  return (
    <section
      className={`ad-app ad-app--${tone} ad-rise`}
      style={delay(index)}
      aria-label={`${title} applications`}
    >
      <header className="ad-app-banner">
        <h3 className="ad-app-title">
          {title}
          <br />
          Application
        </h3>
        <div className="ad-app-total" aria-label={`${stats.total} total`}>
          <CountUp value={stats.total} />
          <span>total</span>
        </div>
        <div className="ad-app-divider" />
        <p className="ad-app-desc">{description}</p>
      </header>

      <div className="ad-app-body">
        {/* Stacked status bar — segments grow in on load */}
        <div
          className="ad-stack"
          role="img"
          aria-label={STATUS_ORDER.map(
            (s) => `${STATUS_LABEL[s]}: ${stats.byStatus[s]}`,
          ).join(", ")}
        >
          {stats.total === 0 ? (
            <span className="ad-stack-empty" />
          ) : (
            STATUS_ORDER.filter((s) => stats.byStatus[s] > 0).map((s, i) => (
              <span
                key={s}
                className={`ad-seg ad-seg--${STATUS_CLASS[s]}`}
                style={{
                  flexGrow: stats.byStatus[s],
                  ["--ad-seg-delay" as string]: `${200 + i * 90}ms`,
                }}
                title={`${STATUS_LABEL[s]}: ${stats.byStatus[s]}`}
              />
            ))
          )}
        </div>

        <ul className="ad-stats">
          {STATUS_ORDER.map((s) => (
            <li
              key={s}
              className={`ad-stat${stats.byStatus[s] === 0 ? " ad-stat--zero" : ""}`}
            >
              <span className="ad-stat-num">
                {stats.byStatus[s].toLocaleString()}
              </span>
              <span className="ad-stat-name">
                <span className={`ad-dot ad-dot--${STATUS_CLASS[s]}`} />
                {/* zero-width space lets "Incomplete/Returned" wrap on narrow tiles */}
                <span>{STATUS_LABEL[s].replace("/", "/\u200b")}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="ad-app-footer">
        <span className="ad-app-recent">
          <Clock3 size={15} aria-hidden="true" />
          {stats.last7Days.toLocaleString()} new in the last 7 days
        </span>
        <button type="button" className="btn-outline-dark" onClick={onOpen}>
          View Table <ArrowRight size={15} aria-hidden="true" />
        </button>
      </footer>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Donut — share of applications per form
 * ------------------------------------------------------------------ */
function Donut({
  accessPass,
  vehicle,
}: {
  accessPass: number;
  vehicle: number;
}) {
  const total = accessPass + vehicle;
  const R = 52;
  const C = 2 * Math.PI * R;
  const apLen = total ? (accessPass / total) * C : 0;
  const vsLen = total ? (vehicle / total) * C : 0;

  return (
    <div className="ad-card ad-rise" style={delay(1)}>
      <h3 className="ad-card-title">Share by form</h3>
      <div className="ad-donut-wrap">
        <svg
          className="ad-donut"
          viewBox="0 0 140 140"
          role="img"
          aria-label={`Access Pass ${accessPass}, Vehicle Sticker ${vehicle}`}
        >
          <circle className="ad-donut-track" cx="70" cy="70" r={R} />
          {total > 0 && (
            <>
              <circle
                className="ad-donut-arc ad-donut-arc--red"
                cx="70"
                cy="70"
                r={R}
                strokeDasharray={`${apLen} ${C - apLen}`}
                style={{ ["--ad-circ" as string]: C }}
              />
              <circle
                className="ad-donut-arc ad-donut-arc--yellow"
                cx="70"
                cy="70"
                r={R}
                strokeDasharray={`${vsLen} ${C - vsLen}`}
                strokeDashoffset={-apLen}
                style={{ ["--ad-circ" as string]: C }}
              />
            </>
          )}
        </svg>
        <div className="ad-donut-center">
          <strong>
            <CountUp value={total} />
          </strong>
          <span>applications</span>
        </div>
      </div>
      <ul className="ad-legend">
        <li>
          <span className="ad-dot ad-dot--red" />
          <span className="ad-legend-name">Access Pass</span>
          <span className="ad-legend-count">
            {pct(accessPass, total)}% · {accessPass}
          </span>
        </li>
        <li>
          <span className="ad-dot ad-dot--yellow" />
          <span className="ad-legend-name">Vehicle Sticker</span>
          <span className="ad-legend-count">
            {pct(vehicle, total)}% · {vehicle}
          </span>
        </li>
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 14-day submissions trend (grouped bars)
 * ------------------------------------------------------------------ */
function TrendChart({ points }: { points: TrendPoint[] }) {
  const max = Math.max(1, ...points.flatMap((p) => [p.accessPass, p.vehicle]));
  const sum = points.reduce((n, p) => n + p.accessPass + p.vehicle, 0);

  return (
    <div className="ad-card ad-card--chart ad-rise" style={delay(0)}>
      <div className="ad-card-head">
        <h3 className="ad-card-title">Submissions · last 14 days</h3>
        <div className="ad-chart-legend">
          <span>
            <span className="ad-dot ad-dot--red" /> Access Pass
          </span>
          <span>
            <span className="ad-dot ad-dot--yellow" /> Vehicle Sticker
          </span>
        </div>
      </div>

      {sum === 0 ? (
        <p className="ad-empty">No submissions in the last 14 days.</p>
      ) : (
        <div className="ad-trend" role="img" aria-label="Daily submissions">
          {points.map((p, i) => (
            <div
              className="ad-trend-col"
              key={p.key}
              title={`${p.label} ${p.day}: ${p.accessPass} access pass, ${p.vehicle} vehicle sticker`}
            >
              <div className="ad-trend-bars">
                <span
                  className="ad-bar ad-bar--red"
                  style={{
                    height: `${(p.accessPass / max) * 100}%`,
                    ["--ad-bar-delay" as string]: `${i * 40}ms`,
                  }}
                />
                <span
                  className="ad-bar ad-bar--yellow"
                  style={{
                    height: `${(p.vehicle / max) * 100}%`,
                    ["--ad-bar-delay" as string]: `${i * 40 + 20}ms`,
                  }}
                />
              </div>
              <span className="ad-trend-day">{p.day}</span>
              <span className="ad-trend-wk">{p.label.slice(0, 1)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Loading skeleton
 * ------------------------------------------------------------------ */
function DashboardSkeleton() {
  return (
    <div className="ad-grid-charts" aria-hidden="true">
      {[0, 1].map((i) => (
        <div key={i} className="ad-skeleton-block ad-skeleton" />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Dashboard
 * ------------------------------------------------------------------ */
export function AdminDashboard() {
  const navigate = useNavigate();
  const { stats, error, refreshing, updatedAt, reload } = useDashboardStats();

  return (
    <section className="ad-root" aria-label="Applications dashboard">
      <div className="ad-head">
        <div>
          <div className="ad-eyebrow">Overview</div>
          <h2 className="ad-heading">Applications Dashboard</h2>
        </div>
        <div className="ad-head-actions">
          <span className="ad-live" title="Auto-refreshes every minute">
            <span className="ad-live-dot" aria-hidden="true" />
            Live
            {updatedAt && (
              <em>
                {" "}
                ·{" "}
                {updatedAt.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </em>
            )}
          </span>
          <button
            type="button"
            className="btn-outline-dark ad-refresh"
            onClick={() => void reload()}
            disabled={refreshing}
            aria-label="Refresh dashboard"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "ad-spin" : undefined}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>
      </div>

      {error && !stats && (
        <div className="ad-card ad-error" role="alert">
          Couldn't load the dashboard numbers.{" "}
          <button type="button" onClick={() => void reload()}>
            Try again
          </button>
        </div>
      )}

      {!stats && !error && <DashboardSkeleton />}

      {stats && (
        <>
          {error && (
            <div className="ad-stale" role="status">
              Showing the last loaded numbers — the latest refresh failed.
            </div>
          )}

          <div className="ad-grid-charts">
            <TrendChart points={stats.trend} />
            <Donut
              accessPass={stats.accessPass.total}
              vehicle={stats.vehicle.total}
            />
          </div>

          <div className="ad-grid-apps">
            <AppPanel
              index={2}
              tone="red"
              title="Access Pass"
              description="Review and approve visitor access pass requests."
              stats={stats.accessPass}
              onOpen={() => navigate("/admin/access-pass")}
            />
            <AppPanel
              index={3}
              tone="yellow"
              title="Vehicle Sticker"
              description="Review and approve vehicle sticker requests."
              stats={stats.vehicle}
              onOpen={() => navigate("/admin/vehicle-sticker")}
            />
          </div>
        </>
      )}
    </section>
  );
}
