import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function ResetFormBar({
  restored,
  onReset,
}: {
  restored: boolean;
  onReset: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(false), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!confirming) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setConfirming(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming]);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {restored
            ? "Draft restored — please re-attach your uploaded files."
            : "Your progress is saved on this device."}
        </p>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-xs font-semibold text-red-600 underline"
        >
          Reset form
        </button>
      </div>

      {confirming &&
        createPortal(
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setConfirming(false)}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-[0_25px_70px_-20px_rgba(15,39,68,0.5)] ring-1 ring-black/5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center gap-3 px-6 pb-5 pt-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 text-amber-600"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 0 0 4 21h16a2 2 0 0 0 1.89-2.96L13.71 3.86a2 2 0 0 0-3.42 0Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Reset this form?
                </h3>
                <p className="text-sm text-gray-500">
                  Everything you entered, including your saved draft, will be
                  cleared.
                </p>
              </div>
              <div className="flex gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setConfirming(false)}
                  className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false);
                    onReset();
                    setToast(true);
                  }}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                >
                  Yes, reset
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {toast &&
        createPortal(
          <div
            role="status"
            className="fixed bottom-6 left-1/2 z-[10001] flex -translate-x-1/2 items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg"
            style={{ animation: "reset-toast-in 0.25s ease-out" }}
          >
            <style>{`@keyframes reset-toast-in{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-green-400"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Form has been reset.
          </div>,
          document.body,
        )}
    </>
  );
}
