import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

/* ---------------------------------------------------------------------
 * CustomCalendarInput
 *
 * A themeable date-picker popover used anywhere a date field is needed.
 * Pass `color` to match whatever section it lives in (blue/amber/red/
 * green/gray). Pass `label` to render it as a labeled field box (used
 * in the applicant modals); omit `label` to render it as a compact
 * icon+text button (used in filter bars like StatusTabFilter).
 *
 * Value/onChange use a plain "YYYY-MM-DD" string, same as a native
 * <input type="date">. The popover renders through a React portal into
 * document.body and is positioned with `position: fixed`, so it always
 * paints above everything else and is never clipped by an ancestor's
 * overflow/z-index (e.g. inside a modal).
 * ------------------------------------------------------------------- */

export type CalendarColor = "blue" | "amber" | "red" | "green" | "gray";

interface ColorTheme {
  label: string;
  borderIdle: string;
  borderHover: string;
  borderOpen: string;
  icon: string;
  valueText: string;
  placeholderText: string;
  selectedDay: string;
  dayHover: string;
  todayRing: string;
  accentText: string;
  accentTextHover: string;
  boxBorderAccent: string;
  navHover: string;
}

const THEMES: Record<CalendarColor, ColorTheme> = {
  blue: {
    label: "text-blue-700",
    borderIdle: "border-blue-100",
    borderHover: "hover:border-blue-200",
    borderOpen: "border-blue-300 ring-2 ring-blue-200",
    icon: "text-blue-500",
    valueText: "text-blue-950",
    placeholderText: "text-blue-300",
    selectedDay: "bg-blue-600 text-white",
    dayHover: "hover:bg-blue-100",
    todayRing: "ring-1 ring-blue-400",
    accentText: "text-blue-600",
    accentTextHover: "hover:text-blue-800",
    boxBorderAccent: "border-l-blue-800",
    navHover: "hover:bg-blue-50",
  },
  amber: {
    label: "text-amber-700",
    borderIdle: "border-amber-200",
    borderHover: "hover:border-amber-400",
    borderOpen: "border-amber-400 ring-2 ring-amber-200",
    icon: "text-amber-500",
    valueText: "text-gray-900",
    placeholderText: "text-amber-700/70",
    selectedDay: "bg-amber-500 text-white",
    dayHover: "hover:bg-amber-50",
    todayRing: "ring-1 ring-amber-400",
    accentText: "text-amber-600",
    accentTextHover: "hover:text-amber-700",
    boxBorderAccent: "border-l-amber-500",
    navHover: "hover:bg-amber-50",
  },
  red: {
    label: "text-red-700",
    borderIdle: "border-red-100",
    borderHover: "hover:border-red-300",
    borderOpen: "border-red-400 ring-2 ring-red-200",
    icon: "text-red-500",
    valueText: "text-red-950",
    placeholderText: "text-red-300",
    selectedDay: "bg-red-600 text-white",
    dayHover: "hover:bg-red-100",
    todayRing: "ring-1 ring-red-400",
    accentText: "text-red-600",
    accentTextHover: "hover:text-red-800",
    boxBorderAccent: "border-l-red-500",
    navHover: "hover:bg-red-50",
  },
  green: {
    label: "text-emerald-700",
    borderIdle: "border-emerald-100",
    borderHover: "hover:border-emerald-300",
    borderOpen: "border-emerald-400 ring-2 ring-emerald-200",
    icon: "text-emerald-500",
    valueText: "text-emerald-950",
    placeholderText: "text-emerald-300",
    selectedDay: "bg-emerald-600 text-white",
    dayHover: "hover:bg-emerald-100",
    todayRing: "ring-1 ring-emerald-400",
    accentText: "text-emerald-600",
    accentTextHover: "hover:text-emerald-800",
    boxBorderAccent: "border-l-emerald-600",
    navHover: "hover:bg-emerald-50",
  },
  gray: {
    label: "text-gray-700",
    borderIdle: "border-gray-200",
    borderHover: "hover:border-gray-300",
    borderOpen: "border-gray-400 ring-2 ring-gray-200",
    icon: "text-gray-500",
    valueText: "text-gray-900",
    placeholderText: "text-gray-400",
    selectedDay: "bg-gray-700 text-white",
    dayHover: "hover:bg-gray-100",
    todayRing: "ring-1 ring-gray-400",
    accentText: "text-gray-600",
    accentTextHover: "hover:text-gray-800",
    boxBorderAccent: "border-l-gray-500",
    navHover: "hover:bg-gray-50",
  },
};

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function isoToDate(iso: string | null): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function dateToIso(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function formatNumeric(iso: string | null): string {
  const d = isoToDate(iso);
  if (!d) return "";
  return `${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}/${d.getFullYear()}`;
}

function formatLong(iso: string | null): string {
  const d = isoToDate(iso);
  if (!d) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface CustomCalendarInputProps {
  value: string | null;
  onChange: (value: string) => void;
  /** Theme to match the section this field lives in. Defaults to "blue". */
  color?: CalendarColor;
  /**
   * If provided, renders as a labeled field box (uppercase caption +
   * value, matching a form field). If omitted, renders as a compact
   * icon+text button (matching a filter bar control).
   */
  label?: string;
  required?: boolean;
  /** Overrides the text shown when no date is selected. */
  placeholder?: string;
}

export function CustomCalendarInput({
  value,
  onChange,
  color = "blue",
  label,
  required,
  placeholder,
}: CustomCalendarInputProps) {
  const theme = THEMES[color];
  const [open, setOpen] = useState(false);
  const selected = isoToDate(value);
  const today = new Date();
  const [viewYear, setViewYear] = useState((selected ?? today).getFullYear());
  const [viewMonth, setViewMonth] = useState((selected ?? today).getMonth());
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updateCoords = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const popoverWidth = 288; // w-72
    let left = rect.left;
    // Clamp so it never runs off the right edge of the viewport.
    if (left + popoverWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - popoverWidth - 8);
    }
    setCoords({ top: rect.bottom + 8, left, width: rect.width });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateCoords();
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const insideTrigger = triggerRef.current?.contains(target);
      const insidePopover = popoverRef.current?.contains(target);
      if (!insideTrigger && !insidePopover) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  function openPicker() {
    const base = selected ?? today;
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setOpen(true);
  }

  function goMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  function selectDay(day: number) {
    onChange(dateToIso(new Date(viewYear, viewMonth, day)));
    setOpen(false);
  }

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  );

  const defaultPlaceholder = label ? "mm/dd/yyyy" : "Any date";
  const displayValue = value
    ? label
      ? formatNumeric(value)
      : formatLong(value)
    : placeholder ?? defaultPlaceholder;

  const popover =
    open &&
    createPortal(
      <div
        ref={popoverRef}
        style={{ position: "fixed", top: coords.top, left: coords.left }}
        className="z-[9999] w-72 max-w-[90vw] rounded-lg border border-gray-200 bg-white p-3 shadow-xl"
      >
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => goMonth(-1)}
            className={`rounded-full p-1.5 text-gray-500 ${theme.navHover}`}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-gray-800">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() => goMonth(1)}
            className={`rounded-full p-1.5 text-gray-500 ${theme.navHover}`}
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-gray-400">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const cellDate = new Date(viewYear, viewMonth, day);
            const isSelected = selected ? sameDay(cellDate, selected) : false;
            const isToday = sameDay(cellDate, today);
            return (
              <button
                key={i}
                type="button"
                onClick={() => selectDay(day)}
                className={[
                  "aspect-square rounded-md text-xs font-medium transition-colors",
                  isSelected
                    ? theme.selectedDay
                    : `text-gray-700 ${theme.dayHover}`,
                  !isSelected && isToday ? theme.todayRing : "",
                ].join(" ")}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 mt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`text-xs font-semibold ${theme.accentText} ${theme.accentTextHover}`}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              const t = new Date();
              onChange(dateToIso(t));
              setViewYear(t.getFullYear());
              setViewMonth(t.getMonth());
              setOpen(false);
            }}
            className={`text-xs font-semibold ${theme.accentText} ${theme.accentTextHover}`}
          >
            Today
          </button>
        </div>
      </div>,
      document.body
    );

  // Labeled variant — a field box with an uppercase caption, matching
  // form-field styling used in detail/edit panels.
  if (label) {
    return (
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => (open ? setOpen(false) : openPicker())}
          className={[
            "w-full rounded-md border border-blue-100 border-l-4 text-left transition-colors",
            theme.boxBorderAccent,
            "bg-white px-3 py-2",
            open ? theme.borderOpen : theme.borderHover,
          ].join(" ")}
        >
          <span
            className={`block text-[10px] font-semibold uppercase tracking-wide ${theme.label}`}
          >
            {label}
            {required && <span className="text-red-500"> *</span>}
          </span>
          <span className="flex items-center justify-between gap-2 mt-1">
            <span
              className={`text-sm font-semibold ${value ? theme.valueText : theme.placeholderText}`}
            >
              {displayValue}
            </span>
            <CalendarIcon className={`h-3.5 w-3.5 shrink-0 ${theme.icon}`} />
          </span>
        </button>
        {popover}
      </div>
    );
  }

  // Compact variant — icon + text button, matching filter-bar controls.
  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        className={[
          "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none",
          value ? theme.valueText : theme.placeholderText,
          theme.borderIdle,
          "bg-white",
          theme.borderHover,
        ].join(" ")}
      >
        <CalendarIcon className={`h-4 w-4 shrink-0 ${theme.icon}`} />
        <span className="truncate">{displayValue}</span>
      </button>
      {popover}
    </div>
  );
}
