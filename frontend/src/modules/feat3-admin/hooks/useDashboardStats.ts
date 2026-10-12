import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TOKEN_KEY } from "../../../providers/AuthProvider";
import { BASE } from "../../../hooks/apiConfig";
import type { ApplicationStatus } from "../../../hooks/types";

/* ------------------------------------------------------------------ *
 * Raw rows returned by GET /api/admin/access-pass and
 * GET /api/admin/vehicle-sticker (both already exist — no backend change).
 * ------------------------------------------------------------------ */
interface RawRow {
  application_id: string;
  applicant_type: string | null;
  date_submitted: string | null;
  status: ApplicationStatus | null;
}

export const STATUS_ORDER: ApplicationStatus[] = [
  "Submitted",
  "Under Review",
  "Incomplete/Returned",
  "Approved",
  "Completed",
  "Rejected",
];

// Same grouping AdminPage already uses for "Pending Applications".
const PENDING: ApplicationStatus[] = [
  "Submitted",
  "Under Review",
  "Incomplete/Returned",
];

export type StatusCounts = Record<ApplicationStatus, number>;

export interface FormStats {
  total: number;
  pending: number;
  approved: number; // Approved + Completed
  rejected: number;
  last7Days: number;
  today: number;
  byStatus: StatusCounts;
}

export interface TrendPoint {
  key: string; // yyyy-mm-dd
  label: string; // "Mon"
  day: number; // day of month
  accessPass: number;
  vehicle: number;
}

export interface TypeSlice {
  label: string;
  count: number;
}

export interface DashboardStats {
  accessPass: FormStats;
  vehicle: FormStats;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  today: number;
  trend: TrendPoint[];
  types: TypeSlice[];
}

const TREND_DAYS = 14;
const REFRESH_MS = 60_000;

const emptyStatusCounts = (): StatusCounts => ({
  Submitted: 0,
  "Under Review": 0,
  "Incomplete/Returned": 0,
  Approved: 0,
  Completed: 0,
  Rejected: 0,
});

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

async function fetchRows(path: string, signal: AbortSignal): Promise<RawRow[]> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${BASE}/api/admin/${path}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return (await res.json()) as RawRow[];
}

function buildFormStats(rows: RawRow[], now: Date): FormStats {
  const byStatus = emptyStatusCounts();
  const todayKey = dayKey(now);
  const weekAgo = new Date(now);
  weekAgo.setHours(0, 0, 0, 0);
  weekAgo.setDate(weekAgo.getDate() - 6);

  let last7Days = 0;
  let today = 0;

  for (const r of rows) {
    if (r.status && r.status in byStatus) byStatus[r.status] += 1;
    if (r.date_submitted) {
      const d = new Date(r.date_submitted.replace(" ", "T"));
      if (!Number.isNaN(d.getTime())) {
        if (d >= weekAgo) last7Days += 1;
        if (dayKey(d) === todayKey) today += 1;
      }
    }
  }

  return {
    total: rows.length,
    pending: PENDING.reduce((n, s) => n + byStatus[s], 0),
    approved: byStatus.Approved + byStatus.Completed,
    rejected: byStatus.Rejected,
    last7Days,
    today,
    byStatus,
  };
}

function buildTrend(ap: RawRow[], vs: RawRow[], now: Date): TrendPoint[] {
  const points: TrendPoint[] = [];
  const index = new Map<string, TrendPoint>();

  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const p: TrendPoint = {
      key: dayKey(d),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      day: d.getDate(),
      accessPass: 0,
      vehicle: 0,
    };
    points.push(p);
    index.set(p.key, p);
  }

  const tally = (rows: RawRow[], field: "accessPass" | "vehicle") => {
    for (const r of rows) {
      if (!r.date_submitted) continue;
      const d = new Date(r.date_submitted.replace(" ", "T"));
      if (Number.isNaN(d.getTime())) continue;
      const p = index.get(dayKey(d));
      if (p) p[field] += 1;
    }
  };
  tally(ap, "accessPass");
  tally(vs, "vehicle");
  return points;
}

function buildTypes(rows: RawRow[]): TypeSlice[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const label = r.applicant_type?.trim() || "Unspecified";
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function useDashboardStats() {
  const [rows, setRows] = useState<{ ap: RawRow[]; vs: RawRow[] } | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const ctrlRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    setRefreshing(true);
    try {
      const [ap, vs] = await Promise.all([
        fetchRows("access-pass", ctrl.signal),
        fetchRows("vehicle-sticker", ctrl.signal),
      ]);
      if (ctrl.signal.aborted) return;
      setRows({ ap, vs });
      setUpdatedAt(new Date());
      setError(false);
    } catch {
      if (!ctrl.signal.aborted) setError(true);
    } finally {
      if (!ctrl.signal.aborted) setRefreshing(false);
    }
  }, []);

  // Initial load + quiet auto-refresh (paused while the tab is hidden).
  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      if (!document.hidden) void load();
    }, REFRESH_MS);
    return () => {
      window.clearInterval(id);
      ctrlRef.current?.abort();
    };
  }, [load]);

  const stats = useMemo<DashboardStats | null>(() => {
    if (!rows) return null;
    const now = new Date();
    const accessPass = buildFormStats(rows.ap, now);
    const vehicle = buildFormStats(rows.vs, now);
    return {
      accessPass,
      vehicle,
      total: accessPass.total + vehicle.total,
      pending: accessPass.pending + vehicle.pending,
      approved: accessPass.approved + vehicle.approved,
      rejected: accessPass.rejected + vehicle.rejected,
      today: accessPass.today + vehicle.today,
      trend: buildTrend(rows.ap, rows.vs, now),
      types: buildTypes([...rows.ap, ...rows.vs]),
    };
  }, [rows]);

  return { stats, error, refreshing, updatedAt, reload: load };
}
