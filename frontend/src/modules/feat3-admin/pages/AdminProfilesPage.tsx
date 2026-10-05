import { useCallback, useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UserPlus, X } from "lucide-react";
import { api } from "../../../api/client";
import { useAuth } from "../../../providers/AuthProvider";

interface AdminUserRow {
  id: number;
  hrep_id: string;
  full_name: string;
  role: "admin" | "reviewer";
  email: string | null;
  contact_no: string | null;
  is_active: boolean;
}

const inputClasses =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

function errorMessage(err: any) {
  const errors = err?.response?.data?.errors;
  return (
    (errors && (Object.values(errors).flat()[0] as string)) ||
    err?.response?.data?.message ||
    "Something went wrong."
  );
}

function AddAdminModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    full_name: "",
    hrep_id: "",
    email: "",
    contact_no: "",
    role: "admin",
    password: "",
    password_confirmation: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/admin/users", {
        ...form,
        full_name: form.full_name.trim(),
        hrep_id: form.hrep_id.trim(),
        email: form.email.trim(),
        contact_no: form.contact_no.trim(),
      });
      toast.success("Admin profile added.");
      onCreated();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const field = (
    label: string,
    key: keyof typeof form,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
    span = false,
  ) => (
    <label
      className={`block text-sm font-medium text-slate-700 ${span ? "sm:col-span-2" : ""}`}
    >
      {label}
      <input
        className={inputClasses}
        value={form[key]}
        onChange={(e) => set(key)(e.target.value)}
        required
        {...props}
      />
    </label>
  );

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--smart-blue-light)] text-[var(--smart-blue)]">
              <UserPlus size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Add Admin Profile
              </h2>
              <p className="text-sm text-slate-500">
                Create an account for a new administrator or reviewer.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          {field("Full name", "full_name", {}, true)}
          {field("HREP ID", "hrep_id")}
          <label className="block text-sm font-medium text-slate-700">
            Role
            <select
              className={inputClasses}
              value={form.role}
              onChange={(e) => set("role")(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="reviewer">Reviewer</option>
            </select>
          </label>
          {field("Email", "email", { type: "email" })}
          {field("Contact no.", "contact_no", { type: "tel" })}
          {field("Password (min. 8 characters)", "password", {
            type: "password",
            autoComplete: "new-password",
          })}
          {field("Confirm password", "password_confirmation", {
            type: "password",
            autoComplete: "new-password",
          })}
        </div>

        {error && (
          <p className="mx-6 mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" className="btn-outline-dark" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-govt-info" disabled={saving}>
            {saving ? "Saving…" : "Add admin"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

export function AdminProfilesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<AdminUserRow[]>("/admin/users");
      setRows(data);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">
            Admin Profiles
          </h2>
          <button
            type="button"
            className="btn btn-govt-info inline-flex items-center gap-2"
            onClick={() => setAddOpen(true)}
          >
            <UserPlus size={16} aria-hidden="true" />
            Add admin
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading…</p>
        ) : error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Full name</th>
                  <th className="py-2 pr-4 font-medium">HREP ID</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Contact no.</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">{r.full_name}</td>
                    <td className="py-2 pr-4">{r.hrep_id}</td>
                    <td className="py-2 pr-4 capitalize">{r.role}</td>
                    <td className="py-2 pr-4">{r.email ?? "—"}</td>
                    <td className="py-2 pr-4">{r.contact_no ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {addOpen && (
        <AddAdminModal onClose={() => setAddOpen(false)} onCreated={load} />
      )}
    </div>
  );
}
