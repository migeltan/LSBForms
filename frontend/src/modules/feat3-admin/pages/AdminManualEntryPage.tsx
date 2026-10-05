import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../../api/client";
import { useAuth } from "../../../providers/AuthProvider";

type AppType = "access-pass" | "vehicle-sticker";

const EMPTY = {
  first_name: "",
  middle_name: "",
  last_name: "",
  suffix: "",
  applicant_type: "",
  contact_number: "",
  email: "",
  plate_number: "",
  vehicle_type: "",
  make: "",
  model: "",
  color: "",
  year: "",
  ownership: "Registered to Applicant",
};
type FormKey = keyof typeof EMPTY;

const KEYS: Record<AppType, FormKey[]> = {
  "access-pass": [
    "first_name",
    "middle_name",
    "last_name",
    "suffix",
    "applicant_type",
    "contact_number",
    "email",
  ],
  "vehicle-sticker": [
    "first_name",
    "middle_name",
    "last_name",
    "contact_number",
    "plate_number",
    "vehicle_type",
    "make",
    "model",
    "color",
    "year",
    "ownership",
  ],
};

const inputClasses =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

export function AdminManualEntryPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<AppType>("access-pass");
  const [form, setForm] = useState(EMPTY);
  const [photo, setPhoto] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [approved, setApproved] = useState(false);
  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{
    id: string;
    type: AppType;
  } | null>(null);

  useEffect(() => {
    api
      .get<{ id: string; name: string }[]>("/applicant-types")
      .then((res) => setTypes(res.data))
      .catch(() => {});
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const set = (key: FormKey) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const text = (
    label: string,
    key: FormKey,
    required = false,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500"> *</span>}
      <input
        className={inputClasses}
        value={form[key]}
        onChange={(e) => set(key)(e.target.value)}
        required={required}
        {...props}
      />
    </label>
  );

  function reset() {
    setForm(EMPTY);
    setPhoto(null);
    setFileKey((k) => k + 1);
    setApproved(false);
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (type === "access-pass" && !photo) {
      setError("Applicant photo is required.");
      return;
    }
    const body = new FormData();
    body.append("type", type);
    KEYS[type].forEach((k) => {
      const v = form[k].trim();
      if (v) body.append(k, v);
    });
    if (type === "access-pass" && photo) body.append("photo", photo);
    body.append("mark_approved", approved ? "1" : "0");

    setSaving(true);
    try {
      const { data } = await api.post("/admin/manual-applications", body);
      toast.success(`Saved as ${data.application_id}`);
      setCreated({ id: data.application_id, type });
      reset();
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      setError(
        (errors && (Object.values(errors).flat()[0] as string)) ||
          err?.response?.data?.message ||
          "Could not save the application.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative left-1/2 flex min-h-[calc(100vh-14rem)] w-[min(100vw_-_2rem,64rem)] -translate-x-1/2 flex-col justify-center gap-6">
      <button
        type="button"
        className="btn-outline-dark self-end border!"
        onClick={() => navigate("/admin")}
      >
        Back to Admin Page
      </button>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold text-slate-900">Manual Entry</h2>
        <p className="mt-1 text-sm text-slate-500">
          Encode an applicant who filed on paper. Only the details needed for
          the pass or sticker are required.
        </p>

        <div className="mt-4 inline-flex rounded-lg border border-slate-300 p-1 text-sm">
          {(
            [
              ["access-pass", "Access Pass"],
              ["vehicle-sticker", "Vehicle Sticker"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setType(value);
                setError("");
              }}
              className={`rounded-md px-4 py-1.5 font-medium ${
                type === value
                  ? "bg-[var(--smart-blue)] text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {created && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            <span>
              Saved as <strong>{created.id}</strong>. You can review it in the
              table.
            </span>
            <button
              type="button"
              className="btn-outline-dark"
              onClick={() =>
                navigate(
                  created.type === "access-pass"
                    ? "/admin/access-pass"
                    : "/admin/vehicle-sticker",
                )
              }
            >
              View table
            </button>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {text("First name", "first_name", true)}
          {text("Middle name", "middle_name")}
          {text("Last name", "last_name", true)}

          {type === "access-pass" ? (
            <>
              {text("Suffix", "suffix")}
              <label className="block text-sm font-medium text-slate-700">
                Applicant type<span className="text-red-500"> *</span>
                <select
                  className={inputClasses}
                  value={form.applicant_type}
                  onChange={(e) => set("applicant_type")(e.target.value)}
                  required
                >
                  <option value="">Select&hellip;</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              {text("Contact no.", "contact_number", false, { type: "tel" })}
              {text("Email", "email", false, { type: "email" })}
              <label className="block text-sm font-medium text-slate-700">
                Applicant photo (2x2)<span className="text-red-500"> *</span>
                <input
                  key={fileKey}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-sm"
                  onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                />
              </label>
            </>
          ) : (
            <>
              {text("Contact no.", "contact_number", false, { type: "tel" })}
              {text("Plate number", "plate_number", true)}
              {text("Vehicle type", "vehicle_type")}
              {text("Make", "make", true)}
              {text("Model", "model", true)}
              {text("Color", "color")}
              {text("Year", "year")}
              <label className="block text-sm font-medium text-slate-700">
                Ownership<span className="text-red-500"> *</span>
                <select
                  className={inputClasses}
                  value={form.ownership}
                  onChange={(e) => set("ownership")(e.target.value)}
                >
                  <option value="Registered to Applicant">
                    Registered to Applicant
                  </option>
                  <option value="Not Registered to Applicant">
                    Not Registered to Applicant
                  </option>
                </select>
              </label>
            </>
          )}
        </div>

        <label className="mt-5 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={approved}
            onChange={(e) => setApproved(e.target.checked)}
          />
          Mark as approved right away (assigns the control number)
        </label>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" className="btn-outline-dark" onClick={reset}>
            Clear
          </button>
          <button type="submit" className="btn btn-govt-info" disabled={saving}>
            {saving ? "Saving…" : "Save application"}
          </button>
        </div>
      </form>
    </div>
  );
}
