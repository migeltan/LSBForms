import { Users } from "lucide-react";

import type {
  FamilyBackgroundRow,
  FamilyBackgroundDraftRow,
} from "../../../../../hooks/types";

const SERIF = { fontFamily: '"Source Serif 4", Georgia, serif' } as const;

function AmberSectionHeader({
  icon,
  count,
  children,
}: {
  icon?: React.ReactNode;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center gap-3 text-[#1f3a6b]">
      {icon}
      <h3 className="text-[22px] font-bold leading-none" style={SERIF}>
        {children}
      </h3>
      {count && (
        <span className="rounded-full border border-gray-300 bg-gray-100 px-3 py-0.5 text-xs font-semibold text-gray-600">
          {count}
        </span>
      )}
    </div>
  );
}

function AmberField({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number | null | undefined;
  shade?: "light" | "medium" | "dark"; // legacy prop, ignored
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

function AmberInput({
  label,
  value,
  onChange,
  required,
  className = "",
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  shade?: "light" | "medium" | "dark"; // legacy prop, ignored
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="mb-2 text-[15px] font-semibold text-gray-900">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </div>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[46px] w-full rounded-2xl border border-gray-300 bg-white px-5 py-3 text-[15px] font-semibold text-gray-800 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 ring-1 ring-amber-200">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-amber-700">
          <path
            d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM15 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
            fill="currentColor"
          />
          <path
            d="M2 19c0-3 3.1-5 7-5s7 2 7 5v1H2v-1ZM16.5 14.3c2.9.4 5.5 2.2 5.5 4.7v1h-4v-1c0-1.8-.6-3.3-1.5-4.7Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <p className="mt-3 text-sm font-semibold text-amber-900">
        No family background records
      </p>
      <p className="text-xs text-amber-600 mt-1">
        This applicant hasn&apos;t submitted any family records yet.
      </p>
    </div>
  );
}

export function FamilyBackgroundModal({
  rows,
  editing,
  draftRows,
  onChange,
  onAdd,
  onRemove,
}: {
  rows: FamilyBackgroundRow[];
  editing: boolean;
  draftRows: FamilyBackgroundDraftRow[];
  onChange: (
    index: number,
    field: keyof FamilyBackgroundDraftRow,
    value: string,
  ) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  if (editing) {
    return (
      <>
        <AmberSectionHeader
          icon={<Users className="h-6 w-6 shrink-0" />}
          count={`${draftRows.length} ${draftRows.length === 1 ? "record" : "records"}`}
        >
          Family Background
        </AmberSectionHeader>

        <div className="flex flex-col gap-6">
          {draftRows.map((f, idx) => (
            <div
              key={f.id ?? `new-${idx}`}
              className="border-t border-gray-300 pt-6 first:border-t-0 first:pt-0"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-500">
                  Member {idx + 1}
                </span>
                <button
                  onClick={() => onRemove(idx)}
                  className="text-xs font-semibold text-[var(--smart-red,#c0392b)] hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-3">
                <AmberInput
                  label="Full Name"
                  value={f.name}
                  onChange={(v) => onChange(idx, "name", v)}
                  required
                  className="sm:col-span-3"
                />
                <AmberInput
                  label="Relationship"
                  value={f.relationship}
                  onChange={(v) => onChange(idx, "relationship", v)}
                  required
                />
                <AmberInput
                  label="Occupation"
                  value={f.occupation}
                  onChange={(v) => onChange(idx, "occupation", v)}
                />
                <AmberInput
                  label="Other Information"
                  value={f.other_information}
                  onChange={(v) => onChange(idx, "other_information", v)}
                />
              </div>
            </div>
          ))}

          <button
            onClick={onAdd}
            className="rounded-2xl border border-dashed border-gray-400 px-4 py-3 text-sm font-semibold text-[#15304f] transition-colors hover:bg-gray-100"
          >
            + Add Family Member
          </button>
        </div>
      </>
    );
  }

  if (rows.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <AmberSectionHeader
        icon={<Users className="h-6 w-6 shrink-0" />}
        count={`${rows.length} ${rows.length === 1 ? "record" : "records"}`}
      >
        Family Background
      </AmberSectionHeader>

      <div className="flex flex-col gap-6">
        {rows.map((f, idx) => (
          <div
            key={f.id}
            className="border-t border-gray-300 pt-6 first:border-t-0 first:pt-0"
          >
            <div className="mb-4 text-sm font-semibold text-gray-500">
              Member {idx + 1}
            </div>
            <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-3">
              <AmberField
                label="Full Name"
                value={f.name}
                className="sm:col-span-3"
              />
              <AmberField label="Relationship" value={f.relationship} />
              <AmberField label="Occupation" value={f.occupation} />
              <AmberField
                label="Other Information"
                value={f.other_information}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
