import { useEffect, useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Camera, Eye, EyeOff } from "lucide-react";
import { api } from "../../../api/client";
import { useAuth } from "../../../providers/AuthProvider";

const inputClasses =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

function initialsOf(name?: string) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "A"
  );
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block text-sm text-slate-700">
      {label}
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className={`${inputClasses} pr-10`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}

export function EditAdminInfoModal({ onClose }: { onClose: () => void }) {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [hrepId, setHrepId] = useState(user?.hrep_id ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile],
  );
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );
  const shownPhoto =
    previewUrl ?? (removePhoto ? null : (user?.photo_url ?? null));

  function handlePhoto(file: File | undefined) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be 5 MB or smaller.");
      return;
    }
    setError("");
    setPhotoFile(file);
    setRemovePhoto(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    const body = new FormData();
    body.append("full_name", fullName.trim());
    body.append("hrep_id", hrepId.trim());
    if (newPassword) {
      body.append("current_password", currentPassword);
      body.append("new_password", newPassword);
      body.append("new_password_confirmation", confirmPassword);
    }
    if (photoFile) body.append("photo", photoFile);
    else if (removePhoto) body.append("remove_photo", "1");

    setSaving(true);
    try {
      const { data } = await api.post("/auth/profile", body);
      updateUser(data.user);
      toast.success("Your information has been updated.");
      onClose();
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      setError(
        (errors && (Object.values(errors).flat()[0] as string)) ||
          err?.response?.data?.message ||
          "Could not save changes.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-xl font-semibold text-slate-900">Edit Info</h2>

        {/* Photo */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-[3px] border-[var(--smart-blue)] bg-[var(--smart-blue-light)] text-2xl font-extrabold text-[var(--smart-blue)]">
              {shownPhoto ? (
                <img
                  src={shownPhoto}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initialsOf(fullName)
              )}
            </div>
            <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--smart-blue)] text-white shadow">
              <Camera size={16} />
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handlePhoto(e.target.files?.[0])}
              />
            </label>
          </div>
          {shownPhoto && (
            <button
              type="button"
              className="text-xs text-slate-500 underline hover:text-slate-700"
              onClick={() => {
                setPhotoFile(null);
                setRemovePhoto(true);
              }}
            >
              Remove photo
            </button>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <label className="block text-sm text-slate-700">
            Full name
            <input
              className={inputClasses}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm text-slate-700">
            HREP ID
            <input
              className={inputClasses}
              value={hrepId}
              onChange={(e) => setHrepId(e.target.value)}
              required
            />
          </label>
        </div>

        {/* Password */}
        <div className="mt-5 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div>
            <p className="text-sm font-medium text-slate-800">
              Change password
            </p>
            <p className="text-xs text-slate-500">
              Leave blank to keep your current password.
            </p>
          </div>
          <PasswordField
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <PasswordField
            label="New password (min. 8 characters)"
            value={newPassword}
            onChange={setNewPassword}
          />
          <PasswordField
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-outline-dark" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-govt-info" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
