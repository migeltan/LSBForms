import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type {
  VehicleApplicantDetail,
  VehiclePersonalInformationDraft,
} from "../../../../../hooks/types";
import { StatusBadge } from "../../StatusBadge";
import { CustomCalendarInput } from "../../../../../components/ui/CustomCalendarInput";

function BlueSectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mt-6 mb-3 first:mt-0">
      <span className="w-2 h-2 rotate-45 bg-blue-600 shrink-0" />
      <h3 className="text-xs font-bold tracking-wide uppercase text-blue-950">
        {children}
      </h3>
    </div>
  );
}

function BlueField({
  label,
  value,
  borderClass,
}: {
  label: string;
  value: string | number | null | undefined;
  borderClass: string;
}) {
  return (
    <div
      className={`rounded-md border border-blue-100 border-l-4 ${borderClass} bg-blue-50/50 px-3 py-2`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold break-words text-blue-950">
        {value || value === 0 ? value : "—"}
      </div>
    </div>
  );
}

type DraftKey = keyof VehiclePersonalInformationDraft;

function BlueInput({
  label,
  value,
  onChange,
  borderClass,
  type = "text",
  required,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  borderClass: string;
  type?: "text" | "email";
  required?: boolean;
}) {
  return (
    <div
      className={`rounded-md border border-blue-100 border-l-4 ${borderClass} bg-white px-3 py-2 transition-colors focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-200`}
    >
      <label className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 p-0 mt-1 text-sm font-semibold bg-transparent border-0 outline-none text-blue-950 focus:ring-0"
      />
    </div>
  );
}

// Custom dropdown — the native <select> popup can't be restyled, so this
// renders its own floating option panel to keep the blue theme consistent.
function BlueSelect({
  label,
  value,
  onChange,
  borderClass,
  options,
  required,
  placeholder = "Select…",
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  borderClass: string;
  options: string[];
  required?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={[
          "w-full rounded-md border border-blue-100 border-l-4 text-left transition-colors",
          borderClass,
          "bg-white px-3 py-2",
          open
            ? "border-blue-300 ring-2 ring-blue-200"
            : "hover:border-blue-200",
        ].join(" ")}
      >
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-blue-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </span>
        <span className="flex items-center justify-between gap-2 mt-1">
          <span
            className={`truncate text-sm font-semibold ${
              value ? "text-blue-950" : "text-blue-300"
            }`}
          >
            {value || placeholder}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-blue-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-lg border border-blue-200 bg-white py-1 shadow-lg shadow-blue-900/10">
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={[
                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold transition-colors",
                  selected
                    ? "bg-blue-600 text-white"
                    : "text-blue-950 hover:bg-blue-50",
                ].join(" ")}
              >
                {opt}
                {selected && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BlueTextarea({
  label,
  value,
  onChange,
  borderClass,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  borderClass: string;
}) {
  return (
    <div
      className={`rounded-md border border-blue-100 border-l-4 ${borderClass} bg-white px-3 py-2 transition-colors focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-200`}
    >
      <label className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
        {label}
      </label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full p-0 mt-1 text-sm font-semibold bg-transparent border-0 outline-none resize-none text-blue-950 focus:ring-0"
      />
    </div>
  );
}

function StatusField({
  status,
  borderClass,
}: {
  status: VehicleApplicantDetail["personal_information"]["status"];
  borderClass: string;
}) {
  return (
    <div
      className={`rounded-md border border-blue-100 border-l-4 ${borderClass} bg-blue-50/50 px-3 py-2`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
        Status
      </div>
      <div className="mt-1">
        {status ? (
          <StatusBadge status={status} />
        ) : (
          <span className="text-sm font-semibold text-blue-950">—</span>
        )}
      </div>
    </div>
  );
}

// One color for the "Application Record" section, a different single
// color for the "Applicant Information" section — no per-field cycling.
const RECORD_BORDER = "border-l-blue-500";
const INFO_BORDER = "border-l-blue-800";

const SEX_OPTIONS = ["Male", "Female"];
const CIVIL_STATUS_OPTIONS = [
  "Single",
  "Married",
  "Widowed",
  "Separated",
  "Divorced",
];
const APPLICANT_TYPE_OPTIONS = ["New", "Renewal", "Transfer", "Duplicate"];

export function VehiclePersonalInformationModal({
  detail,
  editing,
  draft,
  onChange,
}: {
  detail: VehicleApplicantDetail;
  editing: boolean;
  draft: VehiclePersonalInformationDraft | null;
  onChange: (field: DraftKey, value: string) => void;
}) {
  const p = detail.personal_information;

  // Edit mode needs the draft to be ready (set by the parent when
  // "Edit" is clicked). Fall back to read-only if it isn't yet.
  if (editing && draft) {
    return (
      <>
        <BlueSectionHeader>Application Record</BlueSectionHeader>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <BlueField
            label="Application ID"
            value={detail.profile.application_id}
            borderClass={RECORD_BORDER}
          />
          <StatusField status={p.status} borderClass={RECORD_BORDER} />
          <BlueField
            label="Date Submitted"
            value={p.date_submitted}
            borderClass={RECORD_BORDER}
          />
          <BlueField
            label="Date Reviewed"
            value={p.date_reviewed}
            borderClass={RECORD_BORDER}
          />
          <BlueField
            label="Reviewed By"
            value={p.reviewed_by}
            borderClass={RECORD_BORDER}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 mt-3">
          <BlueTextarea
            label="Remarks"
            value={draft.remarks}
            onChange={(v) => onChange("remarks", v)}
            borderClass={RECORD_BORDER}
          />
        </div>

        <BlueSectionHeader>Applicant Information</BlueSectionHeader>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <BlueInput
            label="First Name"
            value={draft.first_name}
            onChange={(v) => onChange("first_name", v)}
            borderClass={INFO_BORDER}
            required
          />
          <BlueInput
            label="Middle Name"
            value={draft.middle_name}
            onChange={(v) => onChange("middle_name", v)}
            borderClass={INFO_BORDER}
          />
          <BlueInput
            label="Last Name"
            value={draft.last_name}
            onChange={(v) => onChange("last_name", v)}
            borderClass={INFO_BORDER}
            required
          />
          <BlueInput
            label="Suffix"
            value={draft.suffix}
            onChange={(v) => onChange("suffix", v)}
            borderClass={INFO_BORDER}
          />
          <CustomCalendarInput
            label="Date of Birth"
            value={draft.date_of_birth}
            onChange={(v) => onChange("date_of_birth", v)}
            color="blue"
          />
          <BlueInput
            label="Place of Birth"
            value={draft.place_of_birth}
            onChange={(v) => onChange("place_of_birth", v)}
            borderClass={INFO_BORDER}
          />
          <BlueSelect
            label="Sex"
            value={draft.sex}
            onChange={(v) => onChange("sex", v)}
            borderClass={INFO_BORDER}
            options={SEX_OPTIONS}
          />
          <BlueSelect
            label="Civil Status"
            value={draft.civil_status}
            onChange={(v) => onChange("civil_status", v)}
            borderClass={INFO_BORDER}
            options={CIVIL_STATUS_OPTIONS}
          />
          <BlueSelect
            label="Applicant Type"
            value={draft.applicant_type}
            onChange={(v) => onChange("applicant_type", v)}
            borderClass={INFO_BORDER}
            options={APPLICANT_TYPE_OPTIONS}
          />
          <BlueInput
            label="Contact Number"
            value={draft.contact_number}
            onChange={(v) => onChange("contact_number", v)}
            borderClass={INFO_BORDER}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 mt-3 sm:grid-cols-2">
          <BlueInput
            label="Email"
            value={draft.email}
            onChange={(v) => onChange("email", v)}
            borderClass={INFO_BORDER}
            type="email"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 mt-3">
          <BlueTextarea
            label="Address"
            value={draft.address}
            onChange={(v) => onChange("address", v)}
            borderClass={INFO_BORDER}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <BlueSectionHeader>Application Record</BlueSectionHeader>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <BlueField
          label="Application ID"
          value={detail.profile.application_id}
          borderClass={RECORD_BORDER}
        />
        <StatusField status={p.status} borderClass={RECORD_BORDER} />
        <BlueField
          label="Date Submitted"
          value={p.date_submitted}
          borderClass={RECORD_BORDER}
        />
        <BlueField
          label="Date Reviewed"
          value={p.date_reviewed}
          borderClass={RECORD_BORDER}
        />
        <BlueField
          label="Reviewed By"
          value={p.reviewed_by}
          borderClass={RECORD_BORDER}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 mt-3">
        <BlueField
          label="Remarks"
          value={p.remarks}
          borderClass={RECORD_BORDER}
        />
      </div>

      <BlueSectionHeader>Applicant Information</BlueSectionHeader>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <BlueField
          label="First Name"
          value={p.first_name}
          borderClass={INFO_BORDER}
        />
        <BlueField
          label="Middle Name"
          value={p.middle_name}
          borderClass={INFO_BORDER}
        />
        <BlueField
          label="Last Name"
          value={p.last_name}
          borderClass={INFO_BORDER}
        />
        <BlueField label="Suffix" value={p.suffix} borderClass={INFO_BORDER} />
        <BlueField
          label="Date of Birth"
          value={p.date_of_birth}
          borderClass={INFO_BORDER}
        />
        <BlueField
          label="Place of Birth"
          value={p.place_of_birth}
          borderClass={INFO_BORDER}
        />
        <BlueField label="Sex" value={p.sex} borderClass={INFO_BORDER} />
        <BlueField
          label="Civil Status"
          value={p.civil_status}
          borderClass={INFO_BORDER}
        />
        <BlueField
          label="Applicant Type"
          value={p.applicant_type}
          borderClass={INFO_BORDER}
        />
        <BlueField
          label="Contact Number"
          value={p.contact_number}
          borderClass={INFO_BORDER}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 mt-3 sm:grid-cols-2">
        <BlueField label="Email" value={p.email} borderClass={INFO_BORDER} />
      </div>
      <div className="grid grid-cols-1 gap-3 mt-3">
        <BlueField
          label="Address"
          value={p.address}
          borderClass={INFO_BORDER}
        />
      </div>
    </>
  );
}
