import { forwardRef, type InputHTMLAttributes } from "react";

/**
 * Supported color themes. Extend this map to add more colors —
 * every className used must be a full, static Tailwind class string
 * (Tailwind can't resolve dynamically-built class names like `focus:border-${color}-500`).
 */
export type TextFieldInputColor =
  | "blue"
  | "amber"
  | "red"
  | "green"
  | "purple"
  | "slate";

interface ColorTheme {
  border: string;
  hoverBorder: string;
  focusBorder: string;
  focusRing: string;
}

const COLOR_THEMES: Record<TextFieldInputColor, ColorTheme> = {
  blue: {
    border: "border-slate-300",
    hoverBorder: "hover:border-slate-400",
    focusBorder: "focus:border-blue-500",
    focusRing: "focus:ring-blue-500/10",
  },
  amber: {
    border: "border-slate-300",
    hoverBorder: "hover:border-slate-400",
    focusBorder: "focus:border-amber-500",
    focusRing: "focus:ring-amber-500/10",
  },
  red: {
    border: "border-slate-300",
    hoverBorder: "hover:border-slate-400",
    focusBorder: "focus:border-red-500",
    focusRing: "focus:ring-red-500/10",
  },
  green: {
    border: "border-slate-300",
    hoverBorder: "hover:border-slate-400",
    focusBorder: "focus:border-green-500",
    focusRing: "focus:ring-green-500/10",
  },
  purple: {
    border: "border-slate-300",
    hoverBorder: "hover:border-slate-400",
    focusBorder: "focus:border-purple-500",
    focusRing: "focus:ring-purple-500/10",
  },
  slate: {
    border: "border-slate-300",
    hoverBorder: "hover:border-slate-400",
    focusBorder: "focus:border-slate-500",
    focusRing: "focus:ring-slate-500/10",
  },
};

export interface TextFieldInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "color"> {
  label?: string;
  /** Theme color — defaults to "blue". */
  color?: TextFieldInputColor;
  /** "default" matches the standalone Field style; "compact" matches the tighter InlineField style used inside repeater rows. */
  size?: "default" | "compact";
  containerClassName?: string;
  labelClassName?: string;
}

export const TextFieldInput = forwardRef<HTMLInputElement, TextFieldInputProps>(
  (
    {
      label,
      color = "blue",
      size = "default",
      required,
      containerClassName = "",
      labelClassName,
      className = "",
      ...inputProps
    },
    ref
  ) => {
    const theme = COLOR_THEMES[color];

    const sizeClasses =
      size === "compact" ? "px-3 py-2 rounded-md" : "px-3.5 py-2.5 rounded-lg";

    const defaultLabelClasses =
      size === "compact"
        ? "mb-1.5 block text-xs font-medium text-slate-500"
        : "mb-1.5 block text-sm font-medium text-slate-700";

    return (
      <div className={containerClassName}>
        {label && (
          <label className={labelClassName ?? defaultLabelClasses}>
            {label} {required && <span className="text-red-600">*</span>}
          </label>
        )}
        <input
          ref={ref}
          required={required}
          className={`w-full border bg-white text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:outline-none focus:ring-4 ${sizeClasses} ${theme.border} ${theme.hoverBorder} ${theme.focusBorder} ${theme.focusRing} ${className}`}
          {...inputProps}
        />
      </div>
    );
  }
);

TextFieldInput.displayName = "TextFieldInput";
