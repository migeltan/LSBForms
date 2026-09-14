import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type {
  VehicleApplicantDetail,
  ApplicationStatus,
  VehicleUpdatePayload,
  VehiclePersonalInformationDraft,
  VehicleInformationDraft,
  DocumentRow,
} from "../../../../hooks/types";
import { TOKEN_KEY } from "../../../../providers/AuthProvider";
import { BASE } from "../../../../hooks/apiConfig";
import { VehicleProfileModal } from "./modal/VehicleProfileModal";
import { VehiclePersonalInformationModal } from "./modal/VehiclePersonalInformationModal";
import { VehicleInformationModal } from "./modal/VehicleInformationModal";
import { VehicleDocumentsModal } from "./modal/VehicleDocumentsModal";
import { SaveCancelModal } from "../../../../components/modals/SaveCancelModal";
import { DeleteModal } from "../../../../components/modals/DeleteModal";
import { CloseButton } from "../../../../components/buttons/CloseButton";

type TabKey = "personal" | "vehicle" | "documents";
type TabColor = "blue" | "yellow" | "green";

type SaveCancelState = "saving" | "success" | "cancelled" | "confirm-cancel";

const TABS: { key: TabKey; label: string; color: TabColor }[] = [
  { key: "personal", label: "Personal Information", color: "blue" },
  { key: "vehicle", label: "Vehicle Information", color: "yellow" },
  { key: "documents", label: "Documents", color: "green" },
];

// Idle tabs are translucent gray; the active tab is highlighted per-key below.
const TAB_IDLE_STYLE =
  "bg-gray-500/10 text-gray-600 ring-1 ring-gray-400/20 hover:bg-gray-500/20 hover:ring-gray-400/30";

const TAB_ACTIVE_STYLES: Record<TabColor, string> = {
  blue: "bg-blue-500/25 text-blue-800 ring-1 ring-blue-500/50 shadow-sm shadow-blue-500/20",
  yellow:
    "bg-yellow-500/25 text-yellow-900 ring-1 ring-yellow-500/50 shadow-sm shadow-yellow-500/20",
  green:
    "bg-emerald-500/25 text-emerald-800 ring-1 ring-emerald-500/50 shadow-sm shadow-emerald-500/20",
};

function draftFromDetail(detail: VehicleApplicantDetail): {
  personal: VehiclePersonalInformationDraft;
  vehicle: VehicleInformationDraft;
} {
  const p = detail.personal_information;
  const v = detail.vehicle_information;
  return {
    personal: {
      first_name: p.first_name ?? "",
      middle_name: p.middle_name,
      last_name: p.last_name ?? "",
      suffix: p.suffix,
      date_of_birth: p.date_of_birth,
      place_of_birth: p.place_of_birth,
      sex: p.sex,
      civil_status: p.civil_status,
      address: p.address,
      contact_number: p.contact_number,
      email: p.email,
      applicant_type: p.applicant_type,
      remarks: p.remarks,
    },
    vehicle: {
      plate_number: v.plate_number,
      vehicle_type: v.vehicle_type,
      make: v.make,
      model: v.model,
      color: v.color,
      year: v.year,
      registration_information: v.registration_information,
      ownership: v.ownership,
    },
  };
}

export function VehicleDetailModal({
  applicantId,
  onClose,
  onDeleted,
}: {
  applicantId: number | null;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const [detail, setDetail] = useState<VehicleApplicantDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("personal");
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Edit mode state — draft copies of the editable fields. Documents
  // are never part of this; they're view/download/replace only, handled
  // independently by VehicleDocumentsModal.
  const [editing, setEditing] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draftPersonal, setDraftPersonal] =
    useState<VehiclePersonalInformationDraft | null>(null);
  const [draftVehicle, setDraftVehicle] =
    useState<VehicleInformationDraft | null>(null);

  // Delete confirmation flow.
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Controls the SaveCancelModal:
  // "saving" — shown immediately on Save click, while the request is in flight
  // "success" — save completed
  // "confirm-cancel" — "are you sure?" step before discarding edits
  // "cancelled" — the discard actually happened
  // null — hidden
  const [saveCancelModal, setSaveCancelModal] = useState(
    null as SaveCancelState | null
  );

  useEffect(() => {
    if (applicantId === null) return;

    let cancelled = false;
    setTab("personal");
    setDetail(null);
    setError(null);
    setReviewError(null);
    setEditing(false);
    setSaveError(null);
    setDeleteModalOpen(false);
    setDeleteError(null);
    setLoading(true);

    async function load() {
      try {
        const token = sessionStorage.getItem(TOKEN_KEY);
        const res = await fetch(
          `${BASE}/api/admin/vehicle-sticker/${applicantId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (!res.ok) throw new Error("Request failed");
        const data: VehicleApplicantDetail = await res.json();
        if (!cancelled) setDetail(data);
      } catch {
        if (!cancelled) setError("Could not load applicant details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [applicantId]);

  // Lock background scroll while the modal is open.
  // Applies to <html> and <body> so any scrollable page/layout
  // behind the modal is frozen, and restores the exact previous
  // inline styles on close/unmount.
  useEffect(() => {
    if (applicantId === null) return;

    const htmlEl = document.documentElement;
    const bodyEl = document.body;

    const prevHtmlOverflow = htmlEl.style.overflow;
    const prevBodyOverflow = bodyEl.style.overflow;
    const prevBodyPosition = bodyEl.style.position;
    const prevBodyTop = bodyEl.style.top;
    const prevBodyWidth = bodyEl.style.width;

    const scrollY = window.scrollY;

    htmlEl.style.overflow = "hidden";
    bodyEl.style.overflow = "hidden";
    bodyEl.style.position = "fixed";
    bodyEl.style.top = `-${scrollY}px`;
    bodyEl.style.width = "100%";

    return () => {
      htmlEl.style.overflow = prevHtmlOverflow;
      bodyEl.style.overflow = prevBodyOverflow;
      bodyEl.style.position = prevBodyPosition;
      bodyEl.style.top = prevBodyTop;
      bodyEl.style.width = prevBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [applicantId]);

  if (applicantId === null) return null;

  async function handleReview(status: ApplicationStatus) {
    if (!detail) return;
    setReviewing(true);
    setReviewError(null);
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      const res = await fetch(
        `${BASE}/api/admin/vehicle-sticker/${detail.profile.application_id}/review`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) throw new Error("Request failed");
      setDetail({
        ...detail,
        personal_information: { ...detail.personal_information, status },
      });
    } catch {
      setReviewError("Could not update the application status.");
    } finally {
      setReviewing(false);
    }
  }

  function startEditing() {
    if (!detail) return;
    const drafts = draftFromDetail(detail);
    setDraftPersonal(drafts.personal);
    setDraftVehicle(drafts.vehicle);
    setSaveError(null);
    setEditing(true);
  }

  // Called after the user confirms "Yes" on the confirm-cancel step.
  function confirmCancelEditing() {
    setEditing(false);
    setSaveError(null);
    setDraftPersonal(null);
    setDraftVehicle(null);
    setSaveCancelModal("cancelled");
  }

  async function handleSave() {
    if (!detail || !draftPersonal || !draftVehicle) return;
    // Show the loading modal immediately — no spinner on the button itself.
    setSaveCancelModal("saving");
    setSaveError(null);
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      const payload: VehicleUpdatePayload = {
        personal_information: draftPersonal,
        vehicle_information: draftVehicle,
      };
      const res = await fetch(
        `${BASE}/api/admin/vehicle-sticker/${detail.profile.applicant_id}/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Request failed");
      const updated: VehicleApplicantDetail = await res.json();
      setDetail(updated);
      setEditing(false);
      setDraftPersonal(null);
      setDraftVehicle(null);
      setSaveCancelModal("success");
    } catch {
      setSaveError("Could not save changes. Please try again.");
      setSaveCancelModal(null);
    }
  }

  async function handleDelete() {
    if (!detail) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      const res = await fetch(
        `${BASE}/api/admin/vehicle-sticker/${detail.profile.applicant_id}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) throw new Error("Request failed");
      setDeleteModalOpen(false);
      onDeleted?.();
      onClose();
    } catch {
      setDeleteError("Could not delete this application. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-6">
          <div
            className="relative w-full max-w-[1400px] h-full sm:h-[900px] max-h-[95vh] rounded-xl p-[1.5px] shadow-[0_25px_70px_-20px_rgba(15,39,68,0.5)]"
            style={{
              background:
                "linear-gradient(135deg, rgba(30,58,95,0.8) 0%, rgba(15,39,68,0.2) 45%, rgba(30,58,95,0.8) 100%)",
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[11px] bg-white ring-1 ring-black/5 flex flex-col">
              {/* Header bar — smart navy theme with diagonal gold/red accent, fixed, does not scroll */}
              <div
                className="shrink-0 px-6 py-5 sm:px-8 sm:py-6 text-white relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)",
                }}
              >
                {/* Diagonal accent stripes, right side */}
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 w-40 sm:w-56"
                  aria-hidden="true"
                >
                  <div
                    className="absolute inset-y-0 right-8 sm:right-12 w-10 sm:w-14"
                    style={{
                      background: "#e0263a",
                      transform: "skewX(-16deg)",
                    }}
                  />
                  <div
                    className="absolute inset-y-0 right-0 w-10 sm:w-14"
                    style={{
                      background: "#f5b012",
                      transform: "skewX(-16deg)",
                    }}
                  />
                </div>

                <div className="relative flex items-start justify-between gap-4">
                  <div className="min-w-0 flex flex-col gap-1.5">
                    <div
                      className="text-xs font-bold tracking-wider uppercase text-[#f5b012]"
                      style={{ letterSpacing: "0.06em" }}
                    >
                      Application Record &middot; Prototype Portal
                    </div>
                    <h2
                      className="text-xl sm:text-2xl font-bold truncate"
                      style={{ color: "#ffffff", letterSpacing: "0.01em" }}
                    >
                      {editing
                        ? "Editing Vehicle Sticker Application"
                        : "Vehicle Sticker Application Details"}
                    </h2>
                  </div>
                  <CloseButton
                    onClick={
                      editing
                        ? () => setSaveCancelModal("confirm-cancel")
                        : onClose
                    }
                    ariaLabel={editing ? "Cancel editing" : "Close"}
                  />
                </div>
              </div>

              {/* Body — fixed height, never scrolls as a whole */}
              <div className="flex-1 min-h-0 flex flex-col px-6 py-5 sm:px-8 sm:py-6 bg-gray-50/40">
                {loading && (
                  <div className="flex items-center gap-2 justify-center py-16 text-gray-400 text-sm">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    Loading applicant&hellip;
                  </div>
                )}

                {!loading && error && (
                  <div className="py-16 text-center text-[var(--smart-red,#c0392b)] text-sm font-medium">
                    {error}
                  </div>
                )}

                {!loading && !error && detail && (
                  <>
                    {/* Profile summary — fixed, does not scroll */}
                    <div className="shrink-0 bg-white rounded-lg border border-gray-200 px-5 py-4 shadow-sm">
                      <VehicleProfileModal
                        detail={detail}
                        onApprove={() => handleReview("Approved")}
                        onDecline={() => handleReview("Rejected")}
                        reviewing={reviewing}
                        reviewError={reviewError}
                      />
                    </div>

                    {/* Tab buttons — idle tabs translucent gray, fixed, does not scroll */}
                    <div className="shrink-0 flex flex-wrap gap-2 mt-5">
                      {TABS.map((t) => {
                        const isActive = tab === t.key;
                        return (
                          <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150 ease-out ${
                              isActive
                                ? TAB_ACTIVE_STYLES[t.color]
                                : TAB_IDLE_STYLE
                            }`}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Only this tab panel scrolls, and only if its content overflows */}
                    <div className="flex-1 min-h-0 overflow-y-auto mt-4 bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-5">
                      {tab === "personal" && (
                        <VehiclePersonalInformationModal
                          detail={detail}
                          editing={editing}
                          draft={draftPersonal}
                          onChange={(field, value) =>
                            setDraftPersonal((prev) =>
                              prev ? { ...prev, [field]: value } : prev
                            )
                          }
                        />
                      )}
                      {tab === "vehicle" && (
                        <VehicleInformationModal
                          detail={detail}
                          editing={editing}
                          draft={draftVehicle}
                          onChange={(field, value) =>
                            setDraftVehicle((prev) =>
                              prev ? { ...prev, [field]: value } : prev
                            )
                          }
                        />
                      )}
                      {tab === "documents" && (
                        <VehicleDocumentsModal
                          documents={detail.documents}
                          editing={editing}
                          onDocumentUpdated={(updated: DocumentRow) =>
                            setDetail((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    documents: prev.documents.map((d) =>
                                      d.id === updated.id ? updated : d
                                    ),
                                  }
                                : prev
                            )
                          }
                        />
                      )}
                    </div>

                    {saveError && (
                      <p className="shrink-0 mt-3 text-xs text-[var(--smart-red,#c0392b)]">
                        {saveError}
                      </p>
                    )}

                    {/* Footer actions — fixed, does not scroll */}
                    <div className="shrink-0 flex justify-end gap-2 pt-5 mt-5 border-t border-gray-200">
                      {editing ? (
                        <>
                          <button
                            onClick={() => setSaveCancelModal("confirm-cancel")}
                            className="rounded-md bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 ring-1 ring-inset ring-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 shadow-sm transition-colors"
                          >
                            Save Changes
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={startEditing}
                            className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 shadow-sm transition-colors inline-flex items-center gap-1.5"
                          >
                            <svg
                              viewBox="0 0 20 20"
                              className="h-4 w-4"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M13.5 3.5l3 3L7 16H4v-3L13.5 3.5Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeleteError(null);
                              setDeleteModalOpen(true);
                            }}
                            className="rounded-md bg-[var(--smart-red,#c0392b)] hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 shadow-sm transition-colors inline-flex items-center gap-1.5"
                          >
                            <svg
                              viewBox="0 0 20 20"
                              className="h-4 w-4"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6m-6.5 0 .6 9.4A1.5 1.5 0 0 0 7.6 17h4.8a1.5 1.5 0 0 0 1.5-1.6L14.5 6"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {saveCancelModal && (
        <SaveCancelModal
          type={saveCancelModal}
          onDone={() => setSaveCancelModal(null)}
          onConfirmCancel={confirmCancelEditing}
          onDismissConfirm={() => setSaveCancelModal(null)}
        />
      )}

      <DeleteModal
        open={deleteModalOpen}
        deleting={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </>
  );
}
