import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ClipboardList, User } from "lucide-react";
import type {
  ApplicantDetail,
  ApplicationStatus,
  PersonalInformationDraft,
} from "../../../../../hooks/types";
import { CustomCalendarInput } from "../../../../../components/ui/CustomCalendarInput";

const SERIF = { fontFamily: '"Source Serif 4", Georgia, serif' } as const;

function BlueSectionHeader({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8 mb-5 flex items-center gap-3 border-t border-gray-300 pt-8 text-[#1f3a6b] first:mt-0 first:border-t-0 first:pt-0">
      {icon}
      <h3 className="text-[22px] font-bold leading-none" style={SERIF}>
        {children}
      </h3>
    </div>
  );
}

function BlueField({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number | null | undefined;
  borderClass?: string; // legacy prop, ignored
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="mb-2 text-[15px] font-semibold text-gray-900">
        {label}
      </div>
      <div className="min-h-[46px] break-words rounded-2xl border border-gray-300 bg-gray-100 px-5 py-3 text-[15px] font-semibold text-gray-700">
        {value || value === 0 ? value : "\u00A0"}
      </div>
    </div>
  );
}

type DraftKey = keyof PersonalInformationDraft;

const PILL_BASE =
  "w-full rounded-2xl border border-gray-300 bg-white px-5 py-3 text-[15px] font-semibold text-gray-800 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-200";

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <div className="mb-2 text-[15px] font-semibold text-gray-900">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </div>
  );
}

function BlueInput({
  label,
  value,
  onChange,
  type = "text",
  required,
  className = "",
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  borderClass?: string; // legacy prop, ignored
  type?: "text" | "email";
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <FieldLabel label={label} required={required} />
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${PILL_BASE} min-h-[46px]`}
      />
    </div>
  );
}

// Custom dropdown — the native <select> popup can't be restyled, so this
// renders its own floating option panel.
function BlueSelect({
  label,
  value,
  onChange,
  options,
  required,
  placeholder = "Select…",
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  borderClass?: string; // legacy prop, ignored
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
    <div ref={rootRef} className="relative min-w-0">
      <FieldLabel label={label} required={required} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={[
          "flex min-h-[46px] w-full items-center justify-between gap-2 rounded-2xl border bg-white px-5 py-3 text-left transition-colors",
          open
            ? "border-blue-400 ring-2 ring-blue-200"
            : "border-gray-300 hover:border-gray-400",
        ].join(" ")}
      >
        <span
          className={`truncate text-[15px] font-semibold ${
            value ? "text-gray-800" : "text-gray-400"
          }`}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-2xl border border-gray-300 bg-white py-1 shadow-lg">
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
                  "flex w-full items-center justify-between px-5 py-2.5 text-left text-[15px] font-semibold transition-colors",
                  selected
                    ? "bg-[#6aa9f5] text-[#0f2744]"
                    : "text-gray-800 hover:bg-gray-100",
                ].join(" ")}
              >
                {opt}
                {selected && <Check className="h-4 w-4" />}
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
  className = "",
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  borderClass?: string; // legacy prop, ignored
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <FieldLabel label={label} />
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className={`${PILL_BASE} resize-none`}
      />
    </div>
  );
}

function StatusField({
  status,
}: {
  status: ApplicationStatus | null | undefined;
  borderClass?: string; // legacy prop, ignored
}) {
  return <BlueField label="Status" value={status} />;
}

const SEX_OPTIONS = ["Male", "Female"];
const CIVIL_STATUS_OPTIONS = [
  "Single",
  "Married",
  "Widowed",
  "Separated",
  "Divorced",
];
const APPLICANT_TYPE_OPTIONS = ["New", "Renewal", "Transfer", "Duplicate"];

export function PersonalInformationModal({
  detail,
  editing,
  draft,
  onChange,
}: {
  detail: ApplicantDetail;
  editing: boolean;
  draft: PersonalInformationDraft | null;
  onChange: (field: DraftKey, value: string) => void;
}) {
  const p = detail.personal_information;

  // Edit mode needs the draft to be ready (set by the parent when
  // "Edit" is clicked). Fall back to read-only if it isn't yet.
  if (editing && draft) {
    const icon = "h-6 w-6 shrink-0";
    return (
      <>
        <BlueSectionHeader icon={<ClipboardList className={icon} />}>
          Application Record
        </BlueSectionHeader>
        <div className="grid grid-cols-2 gap-x-5 gap-y-6 lg:grid-cols-4">
          <BlueField
            label="Application ID"
            value={detail.profile.application_id}
          />
          <StatusField status={p.status} />
          <BlueField label="Date Submitted" value={p.date_submitted} />
          <BlueField label="Date Reviewed" value={p.date_reviewed} />
          <BlueField label="Reviewed By" value={p.reviewed_by} />
          <BlueInput
            label="Declaration Name"
            value={draft.declaration_name}
            onChange={(v) => onChange("declaration_name", v)}
          />
          <CustomCalendarInput
            label="Declaration Date"
            value={draft.declaration_date}
            onChange={(v) => onChange("declaration_date", v)}
            variant="pill"
          />
          <BlueTextarea
            label="Remarks"
            value={draft.remarks}
            onChange={(v) => onChange("remarks", v)}
            className="col-span-2 lg:col-span-4"
          />
        </div>

        <BlueSectionHeader icon={<User className={icon} />}>
          Application Information
        </BlueSectionHeader>
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          <BlueInput
            label="First Name"
            value={draft.first_name}
            onChange={(v) => onChange("first_name", v)}
            required
          />
          <BlueInput
            label="Middle Name"
            value={draft.middle_name}
            onChange={(v) => onChange("middle_name", v)}
          />
          <BlueInput
            label="Last Name"
            value={draft.last_name}
            onChange={(v) => onChange("last_name", v)}
            required
          />
          <BlueInput
            label="Suffix"
            value={draft.suffix}
            onChange={(v) => onChange("suffix", v)}
          />
          <CustomCalendarInput
            label="Date of Birth"
            value={draft.date_of_birth}
            onChange={(v) => onChange("date_of_birth", v)}
            variant="pill"
          />
          <BlueInput
            label="Place of Birth"
            value={draft.place_of_birth}
            onChange={(v) => onChange("place_of_birth", v)}
          />
          <BlueSelect
            label="Sex"
            value={draft.sex}
            onChange={(v) => onChange("sex", v)}
            options={SEX_OPTIONS}
          />
          <BlueSelect
            label="Civil Status"
            value={draft.civil_status}
            onChange={(v) => onChange("civil_status", v)}
            options={CIVIL_STATUS_OPTIONS}
          />
          <BlueSelect
            label="Applicant Type"
            value={draft.applicant_type}
            onChange={(v) => onChange("applicant_type", v)}
            options={APPLICANT_TYPE_OPTIONS}
          />
          <BlueInput
            label="Contact Number"
            value={draft.contact_number}
            onChange={(v) => onChange("contact_number", v)}
          />
          <BlueInput
            label="Email"
            value={draft.email}
            onChange={(v) => onChange("email", v)}
            type="email"
            className="lg:col-span-2"
          />
          <BlueTextarea
            label="Address"
            value={draft.address}
            onChange={(v) => onChange("address", v)}
            className="sm:col-span-2 lg:col-span-3"
          />
        </div>
      </>
    );
  }

  const icon = "h-6 w-6 shrink-0";
  return (
    <>
      <BlueSectionHeader icon={<ClipboardList className={icon} />}>
        Application Record
      </BlueSectionHeader>
      <div className="grid grid-cols-2 gap-x-5 gap-y-6 lg:grid-cols-4">
        <BlueField
          label="Application ID"
          value={detail.profile.application_id}
        />
        <StatusField status={p.status} />
        <BlueField label="Date Submitted" value={p.date_submitted} />
        <BlueField label="Remarks" value={p.remarks} />
        <BlueField label="Date Reviewed" value={p.date_reviewed} />
        <BlueField label="Reviewed By" value={p.reviewed_by} />
        <BlueField label="Declaration Name" value={p.declaration_name} />
        <BlueField label="Declaration Date" value={p.declaration_date} />
      </div>

      <BlueSectionHeader icon={<User className={icon} />}>
        Application Information
      </BlueSectionHeader>
      <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        <BlueField label="First Name" value={p.first_name} />
        <BlueField label="Middle Name" value={p.middle_name} />
        <BlueField label="Last Name" value={p.last_name} />
        <BlueField label="Suffix" value={p.suffix} />
        <BlueField label="Date of Birth" value={p.date_of_birth} />
        <BlueField label="Place of Birth" value={p.place_of_birth} />
        <BlueField label="Sex" value={p.sex} />
        <BlueField label="Civil Status" value={p.civil_status} />
        <BlueField label="Applicant Type" value={p.applicant_type} />
        <BlueField label="Contact Number" value={p.contact_number} />
        <BlueField label="Email" value={p.email} className="lg:col-span-2" />
        <BlueField
          label="Address"
          value={p.address}
          className="sm:col-span-2 lg:col-span-3"
        />
      </div>
    </>
  );
}
