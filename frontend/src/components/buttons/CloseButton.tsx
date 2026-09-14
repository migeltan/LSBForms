/**
 * Shared close ("X") button used across all modals — matches the style
 * originally defined inline in ApplicantDetailModal.tsx's header: white
 * square, soft shadow, subtle ring, hover scale + icon rotate.
 *
 * Sizes down on mobile automatically (h-8/w-8 -> h-9/w-9 at sm:).
 *
 * Usage:
 *   <CloseButton onClick={onClose} />
 *   <CloseButton onClick={onClose} ariaLabel="Cancel editing" className="absolute top-3 right-3 z-20" />
 */
export function CloseButton({
  onClick,
  ariaLabel = "Close",
  className = "",
}: {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`group shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex items-center justify-center bg-white hover:bg-gray-50 active:bg-gray-100 shadow-md shadow-black/25 hover:shadow-lg hover:shadow-black/30 ring-1 ring-white/60 transition-all duration-150 ease-out hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white ${className}`}
    >
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4 sm:h-5 sm:w-5 text-[#0f2744] transition-transform duration-150 ease-out group-hover:rotate-90"
        aria-hidden="true"
      >
        <path
          d="M5 5l10 10M15 5L5 15"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
