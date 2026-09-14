import { useState } from "react";

/**
 * Supported color themes. Extend this map to add more colors —
 * every className used must be a full, static Tailwind class string
 * (Tailwind can't resolve dynamically-built class names like `bg-${color}-50`).
 */
export type UploadFileInputColor =
  | "blue"
  | "amber"
  | "red"
  | "green"
  | "purple"
  | "slate";

interface ColorTheme {
  iconBg: string;
  iconBgHover: string;
  iconText: string;
  border: string;
  borderHover: string;
  bg: string;
  bgHover: string;
  changeText: string;
}

const COLOR_THEMES: Record<UploadFileInputColor, ColorTheme> = {
  blue: {
    iconBg: "bg-blue-50",
    iconBgHover: "group-hover:bg-blue-100",
    iconText: "text-blue-600",
    border: "border-slate-300",
    borderHover: "hover:border-blue-400",
    bg: "bg-slate-50/60",
    bgHover: "hover:bg-blue-50/40",
    changeText: "text-blue-600",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconBgHover: "group-hover:bg-amber-100",
    iconText: "text-amber-600",
    border: "border-slate-300",
    borderHover: "hover:border-amber-400",
    bg: "bg-slate-50/60",
    bgHover: "hover:bg-amber-50/40",
    changeText: "text-amber-600",
  },
  red: {
    iconBg: "bg-red-50",
    iconBgHover: "group-hover:bg-red-100",
    iconText: "text-red-600",
    border: "border-slate-300",
    borderHover: "hover:border-red-400",
    bg: "bg-slate-50/60",
    bgHover: "hover:bg-red-50/40",
    changeText: "text-red-600",
  },
  green: {
    iconBg: "bg-green-50",
    iconBgHover: "group-hover:bg-green-100",
    iconText: "text-green-600",
    border: "border-slate-300",
    borderHover: "hover:border-green-400",
    bg: "bg-slate-50/60",
    bgHover: "hover:bg-green-50/40",
    changeText: "text-green-600",
  },
  purple: {
    iconBg: "bg-purple-50",
    iconBgHover: "group-hover:bg-purple-100",
    iconText: "text-purple-600",
    border: "border-slate-300",
    borderHover: "hover:border-purple-400",
    bg: "bg-slate-50/60",
    bgHover: "hover:bg-purple-50/40",
    changeText: "text-purple-600",
  },
  slate: {
    iconBg: "bg-slate-100",
    iconBgHover: "group-hover:bg-slate-200",
    iconText: "text-slate-600",
    border: "border-slate-300",
    borderHover: "hover:border-slate-400",
    bg: "bg-slate-50/60",
    bgHover: "hover:bg-slate-100/60",
    changeText: "text-slate-600",
  },
};

export interface UploadFileInputProps {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
  accept?: string;
  onChange: (files: FileList | null) => void;
  /** Theme color — defaults to "blue". */
  color?: UploadFileInputColor;
  className?: string;
}

export function UploadFileInput({
  label,
  name,
  hint,
  required = false,
  accept = ".jpg,.jpeg,.png,.pdf",
  onChange,
  color = "blue",
  className = "",
}: UploadFileInputProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const theme = COLOR_THEMES[color];

  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}
        {hint && (
          <span className="ml-1 text-xs font-normal text-slate-400">
            ({hint})
          </span>
        )}
      </label>

      <label
        htmlFor={name}
        className={`group relative flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-4 py-3 transition-colors duration-150 ${theme.border} ${theme.borderHover} ${theme.bg} ${theme.bgHover}`}
      >
        <span
          className={`flex h-9 w-9 flex-none items-center justify-center rounded-md transition-colors ${theme.iconBg} ${theme.iconBgHover} ${theme.iconText}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 7.5L12 3m0 0L7.5 7.5M12 3v13.5"
            />
          </svg>
        </span>

        <span className="flex-1 min-w-0">
          <span
            className={`block truncate text-sm ${
              fileName ? "font-medium text-slate-800" : "text-slate-500"
            }`}
          >
            {fileName ?? "Click to upload or drag file here"}
          </span>
          <span className="block text-xs text-slate-400">
            {accept.replace(/\./g, "").toUpperCase()}
          </span>
        </span>

        {fileName && (
          <span className={`flex-none text-xs font-medium ${theme.changeText}`}>
            Change
          </span>
        )}

        <input
          id={name}
          type="file"
          name={name}
          required={required}
          accept={accept}
          onChange={(e) => {
            setFileName(e.target.files?.[0]?.name ?? null);
            onChange(e.target.files);
          }}
          className="sr-only"
        />
      </label>
    </div>
  );
}
