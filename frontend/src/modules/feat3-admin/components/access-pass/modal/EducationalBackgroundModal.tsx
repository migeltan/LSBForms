import { GraduationCap } from "lucide-react";
import type {
  EducationalBackgroundRow,
  EducationalBackgroundDraftRow,
} from "../../../../../hooks/types";

const SERIF = { fontFamily: '"Source Serif 4", Georgia, serif' } as const;

function RedSectionHeader({
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

function RedField({
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

function RedInput({
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
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 ring-1 ring-red-200">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-red-600">
          <path d="M12 3 1 8l11 5 9-4.09V17h2V8L12 3Z" fill="currentColor" />
          <path
            d="M5 10.18v4.32c0 1.02.7 1.92 1.7 2.34C8.1 17.5 10 18 12 18s3.9-.5 5.3-1.16c1-.42 1.7-1.32 1.7-2.34v-4.32l-7 3.18-7-3.18Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <p className="mt-3 text-sm font-semibold text-red-900">
        No educational background records
      </p>
      <p className="text-xs text-red-400 mt-1">
        This applicant hasn&apos;t submitted any school records yet.
      </p>
    </div>
  );
}

export function EducationalBackgroundModal({
  rows,
  editing,
  draftRows,
  onChange,
  onAdd,
  onRemove,
}: {
  rows: EducationalBackgroundRow[];
  editing: boolean;
  draftRows: EducationalBackgroundDraftRow[];
  onChange: (
    index: number,
    field: keyof EducationalBackgroundDraftRow,
    value: string,
  ) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  if (editing) {
    return (
      <>
        <RedSectionHeader
          icon={<GraduationCap className="h-6 w-6 shrink-0" />}
          count={`${draftRows.length} ${draftRows.length === 1 ? "record" : "records"}`}
        >
          Educational Background
        </RedSectionHeader>

        <div className="flex flex-col gap-6">
          {draftRows.map((e, idx) => (
            <div
              key={e.id ?? `new-${idx}`}
              className="border-t border-gray-300 pt-6 first:border-t-0 first:pt-0"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-500">
                  School {idx + 1}
                </span>
                <button
                  onClick={() => onRemove(idx)}
                  className="text-xs font-semibold text-[var(--smart-red,#c0392b)] hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-3">
                <RedInput
                  label="School Name"
                  value={e.school}
                  onChange={(v) => onChange(idx, "school", v)}
                  required
                  className="sm:col-span-3"
                />
                <RedInput
                  label="Degree"
                  value={e.degree}
                  onChange={(v) => onChange(idx, "degree", v)}
                />
                <RedInput
                  label="Year Graduated"
                  value={e.year_graduated}
                  onChange={(v) => onChange(idx, "year_graduated", v)}
                />
                <RedInput
                  label="Other Information"
                  value={e.other_information}
                  onChange={(v) => onChange(idx, "other_information", v)}
                />
              </div>
            </div>
          ))}

          <button
            onClick={onAdd}
            className="rounded-2xl border border-dashed border-gray-400 px-4 py-3 text-sm font-semibold text-[#15304f] transition-colors hover:bg-gray-100"
          >
            + Add School Record
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
      <RedSectionHeader
        icon={<GraduationCap className="h-6 w-6 shrink-0" />}
        count={`${rows.length} ${rows.length === 1 ? "record" : "records"}`}
      >
        Educational Background
      </RedSectionHeader>

      <div className="flex flex-col gap-6">
        {rows.map((e, idx) => (
          <div
            key={e.id}
            className="border-t border-gray-300 pt-6 first:border-t-0 first:pt-0"
          >
            <div className="mb-4 text-sm font-semibold text-gray-500">
              School {idx + 1}
            </div>
            <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-3">
              <RedField
                label="School Name"
                value={e.school}
                className="sm:col-span-3"
              />
              <RedField label="Degree" value={e.degree} />
              <RedField label="Year Graduated" value={e.year_graduated} />
              <RedField label="Other Information" value={e.other_information} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
