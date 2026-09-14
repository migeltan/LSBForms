import { createPortal } from "react-dom";

export function DeleteModal({
  open,
  deleting,
  error,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  deleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-[0_25px_70px_-20px_rgba(15,39,68,0.5)] ring-1 ring-black/5 overflow-hidden">
        <div className="px-6 pt-6 pb-5 flex flex-col items-center text-center gap-3">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-[var(--smart-red,#c0392b)]"
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
            Delete Application
          </h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this application? This action cannot
            be undone.
          </p>
          {error && (
            <p className="text-xs text-[var(--smart-red,#c0392b)]">{error}</p>
          )}
        </div>
        <div className="flex border-t border-gray-200">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            No
          </button>
          <div className="w-px bg-gray-200" />
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-3 text-sm font-semibold text-white bg-[var(--smart-red,#c0392b)] hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
          >
            {deleting ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Deleting&hellip;
              </>
            ) : (
              "Yes"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
