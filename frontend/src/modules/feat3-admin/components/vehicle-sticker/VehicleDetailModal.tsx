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
import { VehicleStickerPreviewPanel } from "./modal/VehicleStickerPreviewPanel";
import { VehiclePersonalInformationModal } from "./modal/VehiclePersonalInformationModal";
import { VehicleInformationModal } from "./modal/VehicleInformationModal";
import { VehicleDocumentsModal } from "./modal/VehicleDocumentsModal";
import { SaveCancelModal } from "../../../../components/modals/SaveCancelModal";
import { DeleteModal } from "../../../../components/modals/DeleteModal";
import { CloseButton } from "../../../../components/buttons/CloseButton";

type TabKey = "personal" | "vehicle" | "documents";
type SaveCancelState = "saving" | "success" | "cancelled" | "confirm-cancel";

const TABS: { key: TabKey; label: string }[] = [
  { key: "personal", label: "Personal Information" },
  { key: "vehicle", label: "Vehicle Information" },
  { key: "documents", label: "Documents" },
];

// Idle tabs are translucent gray; the active tab is highlighted per-key below.
const TAB_IDLE_STYLE =
  "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200";
const TAB_ACTIVE_STYLE = "bg-[#6aa9f5] text-[#0f2744] border border-[#4f95ee]";

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
  onChanged,
}: {
  applicantId: number | null;
  onClose: () => void;
  onDeleted?: () => void;
  onChanged?: () => void;
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
    null as SaveCancelState | null,
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
          },
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
        },
      );
      if (!res.ok) throw new Error("Request failed");
      setDetail({
        ...detail,
        personal_information: { ...detail.personal_information, status },
      });
      onChanged?.();
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
        },
      );
      if (!res.ok) throw new Error("Request failed");
      const updated: VehicleApplicantDetail = await res.json();
      setDetail(updated);
      setEditing(false);
      setDraftPersonal(null);
      setDraftVehicle(null);
      setSaveCancelModal("success");
      onChanged?.();
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
        },
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
            className="relative w-full max-w-[1400px] h-full sm:h-[900px] max-h-[95vh] rounded-[28px] p-[1.5px] shadow-[0_25px_70px_-20px_rgba(15,39,68,0.5)]"
            style={{
              background:
                "linear-gradient(135deg, rgba(30,58,95,0.8) 0%, rgba(15,39,68,0.2) 45%, rgba(30,58,95,0.8) 100%)",
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[26.5px] bg-white ring-1 ring-black/5 flex flex-col">
              {/* Header bar */}
              <div className="shrink-0 flex items-center justify-between gap-4 px-8 py-6 text-white bg-[#15304f] sm:px-16 sm:py-8">
                <h2
                  className="truncate text-3xl font-bold tracking-tight"
                  style={{
                    color: "#ffffff",
                    fontFamily: "var(--smart-font-sans)",
                  }}
                >
                  {editing
                    ? "Editing Vehicle Sticker Application"
                    : "Vehicle Sticker Application Details"}
                </h2>
                <CloseButton
                  onClick={
                    editing
                      ? () => setSaveCancelModal("confirm-cancel")
                      : onClose
                  }
                  ariaLabel={editing ? "Cancel editing" : "Close"}
                  className="sm:h-12! sm:w-12!"
                />
              </div>

              {/* Body — fixed height, never scrolls as a whole */}
              <div className="flex-1 min-h-0 flex flex-col bg-[#f7f7f5]">
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
                  <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
                    {/* LEFT: preview + actions */}
                    <aside className="flex shrink-0 flex-col overflow-y-auto border-b border-gray-300 px-8 py-8 lg:w-[37%] lg:border-b-0 lg:border-r xl:px-[72px]">
                      <VehicleStickerPreviewPanel
                        detail={detail}
                        onApprove={() => handleReview("Approved")}
                        onDecline={() => handleReview("Rejected")}
                        reviewing={reviewing}
                        reviewError={reviewError}
                      />
                    </aside>

                    {/* RIGHT: tabs, record, footer */}
                    <section className="flex-1 min-w-0 min-h-0 flex flex-col px-8 py-8 xl:px-14">
                      <div className="shrink-0 flex flex-wrap gap-3 pb-6 border-b border-gray-300">
                        {TABS.map((t) => (
                          <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`rounded-2xl px-6 py-2.5 text-sm font-semibold transition-colors ${
                              tab === t.key ? TAB_ACTIVE_STYLE : TAB_IDLE_STYLE
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto pt-6 pr-2">
                        {tab === "personal" && (
                          <VehiclePersonalInformationModal
                            detail={detail}
                            editing={editing}
                            draft={draftPersonal}
                            onChange={(field, value) =>
                              setDraftPersonal((prev) =>
                                prev ? { ...prev, [field]: value } : prev,
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
                                prev ? { ...prev, [field]: value } : prev,
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
                                        d.id === updated.id ? updated : d,
                                      ),
                                    }
                                  : prev,
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
                      <div className="shrink-0 flex justify-end gap-3 pt-5 mt-3 border-t border-gray-300">
                        {editing ? (
                          <>
                            <button
                              onClick={() =>
                                setSaveCancelModal("confirm-cancel")
                              }
                              className="rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-6 py-3 ring-1 ring-inset ring-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSave}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-3 shadow-sm transition-colors"
                            >
                              Save Changes
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={startEditing}
                              className="rounded-lg bg-[#0d5cff] hover:bg-[#0a4ad4] text-white text-sm font-semibold px-6 py-3 shadow-sm transition-colors inline-flex items-center gap-1.5"
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
                              className="rounded-lg bg-[#ef3e55] hover:bg-red-600 text-white text-sm font-semibold px-6 py-3 shadow-sm transition-colors inline-flex items-center gap-1.5"
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
                    </section>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body,
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
