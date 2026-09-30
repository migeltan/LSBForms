import { Car, ClipboardList, ShieldCheck } from "lucide-react";
import type {
  VehicleApplicantDetail,
  VehicleInformationDraft,
} from "../../../../../hooks/types";

const SERIF = { fontFamily: '"Source Serif 4", Georgia, serif' } as const;

const PILL_BASE =
  "w-full rounded-2xl border border-gray-300 bg-white px-5 py-3 text-[15px] font-semibold text-gray-800 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-200";

function SectionHeader({
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

function Cell({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number | null | undefined;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <FieldLabel label={label} />
      <div className="min-h-[46px] break-words rounded-2xl border border-gray-300 bg-gray-100 px-5 py-3 text-[15px] font-semibold text-gray-700">
        {value || value === 0 ? value : "\u00A0"}
      </div>
    </div>
  );
}

type DraftKey = keyof VehicleInformationDraft;

function PillInput({
  label,
  value,
  onChange,
  type = "text",
  required,
  className = "",
}: {
  label: string;
  value: string | number | null;
  onChange: (value: string) => void;
  type?: "text" | "number";
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

function PillTextarea({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
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

export function VehicleInformationModal({
  detail,
  editing,
  draft,
  onChange,
}: {
  detail: VehicleApplicantDetail;
  editing: boolean;
  draft: VehicleInformationDraft | null;
  onChange: (field: DraftKey, value: string) => void;
}) {
  const v = detail.vehicle_information;

  // Edit mode needs the draft to be ready (set by the parent when
  // "Edit" is clicked). Fall back to read-only if it isn't yet.
  const icon = "h-6 w-6 shrink-0";

  if (editing && draft) {
    return (
      <>
        <SectionHeader icon={<Car className={icon} />}>
          Vehicle Details
        </SectionHeader>
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          <PillInput
            label="Plate Number"
            value={draft.plate_number}
            onChange={(val) => onChange("plate_number", val)}
            required
          />
          <PillInput
            label="Vehicle Type"
            value={draft.vehicle_type}
            onChange={(val) => onChange("vehicle_type", val)}
          />
          <PillInput
            label="Make"
            value={draft.make}
            onChange={(val) => onChange("make", val)}
          />
          <PillInput
            label="Model"
            value={draft.model}
            onChange={(val) => onChange("model", val)}
          />
          <PillInput
            label="Color"
            value={draft.color}
            onChange={(val) => onChange("color", val)}
          />
          <PillInput
            label="Year"
            value={draft.year}
            onChange={(val) => onChange("year", val)}
          />
        </div>

        <SectionHeader icon={<ClipboardList className={icon} />}>
          Registration &amp; Ownership
        </SectionHeader>
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
          <PillTextarea
            label="Registration Information"
            value={draft.registration_information}
            onChange={(val) => onChange("registration_information", val)}
          />
          <PillInput
            label="Ownership"
            value={draft.ownership}
            onChange={(val) => onChange("ownership", val)}
          />
        </div>

        <SectionHeader icon={<ShieldCheck className={icon} />}>
          Clearance &amp; Sticker Issuance
        </SectionHeader>
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          <Cell label="Clearance Status" value={v.clearance_status} />
          <Cell label="Sticker Number" value={v.sticker_number} />
          <Cell label="Approval Date" value={v.approval_date} />
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Clearance status, sticker number, and approval date are set via the
          Approve/Decline action, not this form.
        </p>
      </>
    );
  }

  return (
    <>
      <SectionHeader icon={<Car className={icon} />}>
        Vehicle Details
      </SectionHeader>
      <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        <Cell label="Plate Number" value={v.plate_number} />
        <Cell label="Vehicle Type" value={v.vehicle_type} />
        <Cell label="Make" value={v.make} />
        <Cell label="Model" value={v.model} />
        <Cell label="Color" value={v.color} />
        <Cell label="Year" value={v.year} />
      </div>

      <SectionHeader icon={<ClipboardList className={icon} />}>
        Registration &amp; Ownership
      </SectionHeader>
      <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
        <Cell
          label="Registration Information"
          value={v.registration_information}
        />
        <Cell label="Ownership" value={v.ownership} />
      </div>

      <SectionHeader icon={<ShieldCheck className={icon} />}>
        Clearance &amp; Sticker Issuance
      </SectionHeader>
      <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        <Cell label="Clearance Status" value={v.clearance_status} />
        <Cell label="Sticker Number" value={v.sticker_number} />
        <Cell label="Approval Date" value={v.approval_date} />
      </div>
    </>
  );
}
