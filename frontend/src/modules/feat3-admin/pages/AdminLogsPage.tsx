import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "../../../api/client";
import { useAuth } from "../../../providers/AuthProvider";

interface LogRow {
  id: number;
  application_id: string | null;
  action: string;
  remarks: string | null;
  created_at: string;
  user: { id: number; full_name: string; hrep_id: string } | null;
}

interface LogPage {
  data: LogRow[];
  current_page: number;
  last_page: number;
  total: number;
}

const FILTERS = [
  { label: "All", term: "" },
  { label: "Approved", term: "Approved" },
  { label: "Declined", term: "Rejected" },
  { label: "Deleted", term: "deleted" },
  { label: "Updated", term: "updated" },
];

function actionStyle(action: string) {
  if (/approved/i.test(action)) return "bg-green-100 text-green-800";
  if (/rejected|deleted/i.test(action)) return "bg-red-100 text-red-800";
  if (/added|logged in/i.test(action)) return "bg-blue-100 text-blue-800";
  return "bg-slate-100 text-slate-700";
}

export function AdminLogsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<LogPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let ignore = false;
    setLoading(true);
    api
      .get<LogPage>("/admin/logs", {
        params: { q: debounced, action: term, page },
      })
      .then(({ data }) => {
        if (ignore) return;
        setResult(data);
        setError(null);
      })
      .catch((err: any) => {
        if (ignore) return;
        setError(
          err?.response?.data?.message ?? "Could not load the activity log.",
        );
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, debounced, term, page]);

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const rows = result?.data ?? [];

  return (
    <div className="relative left-1/2 flex min-h-[calc(100vh-14rem)] w-[min(100vw_-_2rem,80rem)] -translate-x-1/2 flex-col justify-center gap-6">
      <button
        type="button"
        className="btn-outline-dark self-end border!"
        onClick={() => navigate("/admin")}
      >
        Back to Admin Page
      </button>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Activity Log</h2>
        <p className="mt-1 text-sm text-slate-500">
          Actions taken by admins within the system, newest first.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[16rem] flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Search by admin, application ID, action…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => {
                  setTerm(f.term);
                  setPage(1);
                }}
                className={`rounded-full border px-3 py-1 text-sm ${
                  term === f.term
                    ? "border-[var(--smart-blue)] bg-[var(--smart-blue)] text-white"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : loading && !result ? (
          <p className="mt-4 text-sm text-slate-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No activity found.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Date &amp; time</th>
                  <th className="py-2 pr-4 font-medium">Admin</th>
                  <th className="py-2 pr-4 font-medium">Action</th>
                  <th className="py-2 pr-4 font-medium">Application</th>
                  <th className="py-2 pr-4 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="whitespace-nowrap py-2 pr-4">
                      {new Date(r.created_at).toLocaleString("en-PH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-2 pr-4">
                      {r.user?.full_name ?? "—"}
                      {r.user && (
                        <span className="block text-xs text-slate-400">
                          {r.user.hrep_id}
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${actionStyle(r.action)}`}
                      >
                        {r.action.replace("Rejected", "Declined")}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{r.application_id ?? "—"}</td>
                    <td className="py-2 pr-4 text-slate-600">
                      {r.remarks ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result && result.last_page > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>
              Page {result.current_page} of {result.last_page} · {result.total}{" "}
              entries
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-outline-dark"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn-outline-dark"
                disabled={page >= result.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
