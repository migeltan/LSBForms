import type {
  VehicleApplicantDetail,
  VehicleInformationDraft,
} from "../../../../../hooks/types";

function YellowSectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-6 first:mt-0">
      <span className="h-2 w-2 rotate-45 shrink-0 bg-[var(--smart-yellow,#d4a017)]" />
      <h3 className="text-xs font-bold uppercase tracking-wide text-yellow-900">
        {children}
      </h3>
    </div>
  );
}

function YellowField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-md border border-yellow-100 border-l-4 border-l-[var(--smart-yellow,#d4a017)] bg-yellow-50/50 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-yellow-800">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-yellow-950">
        {value || value === 0 ? value : "—"}
      </div>
    </div>
  );
}

type DraftKey = keyof VehicleInformationDraft;

function YellowInput({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string | number | null;
  onChange: (value: string) => void;
  type?: "text" | "number";
  required?: boolean;
}) {
  return (
    <div className="rounded-md border border-yellow-100 border-l-4 border-l-[var(--smart-yellow,#d4a017)] bg-white px-3 py-2">
      <label className="text-[10px] font-semibold uppercase tracking-wide text-yellow-800">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full text-sm font-semibold text-yellow-950 bg-transparent outline-none focus:ring-0 border-0 p-0"
      />
    </div>
  );
}

function YellowTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-md border border-yellow-100 border-l-4 border-l-[var(--smart-yellow,#d4a017)] bg-white px-3 py-2">
      <label className="text-[10px] font-semibold uppercase tracking-wide text-yellow-800">
        {label}
      </label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="mt-1 w-full text-sm font-semibold text-yellow-950 bg-transparent outline-none focus:ring-0 border-0 p-0 resize-none"
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
  if (editing && draft) {
    return (
      <>
        <YellowSectionHeader>Vehicle Details</YellowSectionHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <YellowInput
            label="Plate Number"
            value={draft.plate_number}
            onChange={(val) => onChange("plate_number", val)}
            required
          />
          <YellowInput
            label="Vehicle Type"
            value={draft.vehicle_type}
            onChange={(val) => onChange("vehicle_type", val)}
          />
          <YellowInput
            label="Make"
            value={draft.make}
            onChange={(val) => onChange("make", val)}
          />
          <YellowInput
            label="Model"
            value={draft.model}
            onChange={(val) => onChange("model", val)}
          />
          <YellowInput
            label="Color"
            value={draft.color}
            onChange={(val) => onChange("color", val)}
          />
          <YellowInput
            label="Year"
            value={draft.year}
            onChange={(val) => onChange("year", val)}
          />
        </div>

        <YellowSectionHeader>Registration &amp; Ownership</YellowSectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <YellowTextarea
            label="Registration Information"
            value={draft.registration_information}
            onChange={(val) => onChange("registration_information", val)}
          />
          <YellowInput
            label="Ownership"
            value={draft.ownership}
            onChange={(val) => onChange("ownership", val)}
          />
        </div>

        <YellowSectionHeader>
          Clearance &amp; Sticker Issuance
        </YellowSectionHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <YellowField label="Clearance Status" value={v.clearance_status} />
          <YellowField label="Sticker Number" value={v.sticker_number} />
          <YellowField label="Approval Date" value={v.approval_date} />
        </div>
        <p className="mt-2 text-[10px] text-yellow-700">
          Clearance status, sticker number, and approval date are set via the
          Approve/Decline action, not this form.
        </p>
      </>
    );
  }

  return (
    <>
      <YellowSectionHeader>Vehicle Details</YellowSectionHeader>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <YellowField label="Plate Number" value={v.plate_number} />
        <YellowField label="Vehicle Type" value={v.vehicle_type} />
        <YellowField label="Make" value={v.make} />
        <YellowField label="Model" value={v.model} />
        <YellowField label="Color" value={v.color} />
        <YellowField label="Year" value={v.year} />
      </div>

      <YellowSectionHeader>Registration &amp; Ownership</YellowSectionHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <YellowField
          label="Registration Information"
          value={v.registration_information}
        />
        <YellowField label="Ownership" value={v.ownership} />
      </div>

      <YellowSectionHeader>
        Clearance &amp; Sticker Issuance
      </YellowSectionHeader>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <YellowField label="Clearance Status" value={v.clearance_status} />
        <YellowField label="Sticker Number" value={v.sticker_number} />
        <YellowField label="Approval Date" value={v.approval_date} />
      </div>
    </>
  );
}
