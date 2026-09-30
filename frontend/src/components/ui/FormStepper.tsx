import { Check, type LucideIcon } from "lucide-react";

export interface StepItem {
  label: string;
  icon: LucideIcon;
}

interface Props {
  steps: StepItem[];
  current: number;
  maxReached: number;
  onSelect: (index: number) => void;
}

export function FormStepper({ steps, current, maxReached, onSelect }: Props) {
  const n = steps.length;
  const pct = n > 1 ? (current / (n - 1)) * 100 : 0;

  return (
    <nav
      aria-label="Application progress"
      className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
    >
      <ol
        className="relative grid"
        style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
      >
        {/* track + fill, inset so it runs centre-to-centre of the end circles */}
        <div
          aria-hidden
          className="absolute top-5 h-1 -translate-y-1/2 rounded bg-slate-200"
          style={{ left: `${50 / n}%`, right: `${50 / n}%` }}
        >
          <div
            className="h-1 rounded bg-[var(--smart-blue)] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        {steps.map(({ label, icon: Icon }, i) => {
          const done = i < current;
          const active = i === current;
          const reachable = i <= maxReached;
          return (
            <li key={label} className="relative z-10 flex justify-center">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onSelect(i)}
                aria-current={active ? "step" : undefined}
                className="flex flex-col items-center gap-1.5 focus:outline-none disabled:cursor-not-allowed"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md ring-4 transition-all ${
                    done
                      ? "bg-emerald-600 text-white ring-white"
                      : active
                        ? "bg-[var(--smart-blue)] text-white ring-blue-200"
                        : "bg-slate-200 text-slate-500 ring-white"
                  }`}
                >
                  {done ? <Check size={16} /> : <Icon size={16} />}
                </span>
                <span
                  className={`text-xs ${
                    active
                      ? "font-bold text-[var(--smart-blue)]"
                      : done
                        ? "font-semibold text-slate-800"
                        : "font-medium text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
