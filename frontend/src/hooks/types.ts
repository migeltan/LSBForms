export type ApplicationStatus =
  | "Submitted"
  | "Incomplete/Returned"
  | "Approved"
  | "Rejected"
  | "Under Review"
  | "Completed";

// --- Access Pass: admin table row ---
export interface AccessPassRow {
  applicant_id: number;
  application_id: string;
  full_name: string;
  applicant_type: string;
  date_submitted: string;
  status: ApplicationStatus;
}

// --- Access Pass: applicant detail modal ---
export interface ApplicantProfile {
  photo_path: string | null;
  application_id: string;
  applicant_id: number;
  application_type: string | null;
  full_name: string;
}

export interface PersonalInformation {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  date_of_birth: string | null;
  place_of_birth: string | null;
  sex: string | null;
  civil_status: string | null;
  address: string | null;
  contact_number: string | null;
  email: string | null;
  applicant_type: string | null;
  status: ApplicationStatus | null;
  date_submitted: string | null;
  date_reviewed: string | null;
  reviewed_by: string | null;
  remarks: string | null;
  declaration_name: string | null;
  declaration_date: string | null;
}

export interface FamilyBackgroundRow {
  id: number;
  relationship: string;
  name: string;
  occupation: string | null;
  other_information: string | null;
}

export interface EducationalBackgroundRow {
  id: number;
  school: string;
  degree: string | null;
  year_graduated: string | null;
  other_information: string | null;
}

export interface DocumentRow {
  id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  verification_status: string;
}

export interface ApplicantDetail {
  profile: ApplicantProfile;
  personal_information: PersonalInformation;
  family_background: FamilyBackgroundRow[];
  educational_background: EducationalBackgroundRow[];
  documents: DocumentRow[];
}

// --- Access Pass: edit-mode draft types (used by the applicant modal's
// Edit/Save flow — PATCH /api/admin/access-pass/{applicantId}/update) ---

// `id` is optional on draft rows because a newly-added row (via the
// "+ Add" button in the Family/Educational Background tabs) doesn't
// have one yet — the backend treats a missing id as "create".
export interface FamilyBackgroundDraftRow {
  id?: number;
  relationship: string;
  name: string;
  occupation: string | null;
  other_information: string | null;
}

export interface EducationalBackgroundDraftRow {
  id?: number;
  school: string;
  degree: string | null;
  year_graduated: string | null;
  other_information: string | null;
}

// Draft copy of the editable personal_information fields — excludes
// status/date_submitted/date_reviewed/reviewed_by, which are managed
// by the Approve/Decline review action, not this form.
export interface PersonalInformationDraft {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  date_of_birth: string | null;
  place_of_birth: string | null;
  sex: string | null;
  civil_status: string | null;
  address: string | null;
  contact_number: string | null;
  email: string | null;
  applicant_type: string | null;
  remarks: string | null;
  declaration_name: string | null;
  declaration_date: string | null;
}

export interface AccessPassUpdatePayload {
  personal_information: PersonalInformationDraft;
  family_background: FamilyBackgroundDraftRow[];
  educational_background: EducationalBackgroundDraftRow[];
}

// --- Vehicle Sticker: admin table row ---
export interface VehicleStickerRow {
  applicant_id: number;
  application_id: string;
  full_name: string;
  applicant_type: string;
  plate_number: string;
  date_submitted: string;
  status: ApplicationStatus;
}

// --- Vehicle Sticker: applicant detail modal ---
export interface VehicleApplicantDetail {
  profile: {
    application_id: string;
    applicant_id: number;
    application_type: string | null;
    full_name: string | null;
  };
  personal_information: {
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
    suffix: string | null;
    date_of_birth: string | null;
    place_of_birth: string | null;
    sex: string | null;
    civil_status: string | null;
    address: string | null;
    contact_number: string | null;
    email: string | null;
    applicant_type: string | null;
    status: ApplicationStatus | null;
    date_submitted: string | null;
    date_reviewed: string | null;
    reviewed_by: string | null;
    remarks: string | null;
  };
  vehicle_information: {
    plate_number: string | null;
    vehicle_type: string | null;
    make: string | null;
    model: string | null;
    color: string | null;
    year: string | number | null;
    registration_information: string | null;
    ownership: string | null;
    clearance_status: string | null;
    sticker_number: string | null;
    approval_date: string | null;
  };
  documents: DocumentRow[];
}

// --- Vehicle Sticker: edit-mode draft types (used by the vehicle modal's
// Edit/Save flow — PATCH /api/admin/vehicle-sticker/{applicantId}/update) ---

// Draft copy of the editable personal_information fields — excludes
// status/date_submitted/date_reviewed/reviewed_by, which are managed
// by the Approve/Decline review action, not this form.
export interface VehiclePersonalInformationDraft {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  date_of_birth: string | null;
  place_of_birth: string | null;
  sex: string | null;
  civil_status: string | null;
  address: string | null;
  contact_number: string | null;
  email: string | null;
  applicant_type: string | null;
  remarks: string | null;
}

// Draft copy of the editable vehicle_information fields — excludes
// clearance_status/sticker_number/approval_date, which are managed by
// the Approve/Decline review action, not this form.
export interface VehicleInformationDraft {
  plate_number: string | null;
  vehicle_type: string | null;
  make: string | null;
  model: string | null;
  color: string | null;
  year: string | number | null;
  registration_information: string | null;
  ownership: string | null;
}

export interface VehicleUpdatePayload {
  personal_information: VehiclePersonalInformationDraft;
  vehicle_information: VehicleInformationDraft;
}

// --- Application Search: status page search bar + filters + table ---
export interface ApplicationSearchRow {
  applicant_id: number | string | null;
  application_id: string;
  application_type: string;
  name: string | null;
  date_submitted: string | null;
  status: ApplicationStatus | string;
}

// --- Application Search: status page search bar + filters + table ---
// REPLACES the previous ApplicationSearchParams (which had a single
// `query` field) — now name and application_id are separate, and there's
// a status filter. ApplicationSearchRow and ApplicationStatusLookup are
// unchanged, leave those as they are in your existing types.ts.
export interface ApplicationSearchParams {
  name?: string;
  applicationId?: string;
  type?: "access-pass" | "vehicle-sticker";
  date?: string;
  status?: string;
}

// --- Application Status: reference-number lookup (GET /status/{reference}) ---
export interface ApplicationStatusLookup {
  reference: string;
  type: string;
  stage: string;
  updatedAt: string;
}

// --- Status page: applicant profile modal (StatusModalProfile.tsx) ---
// Deliberately a lean, public-safe subset — NOT the full ApplicantDetail /
// VehicleApplicantDetail used by the admin modals (no family/education/
// documents). Backed by GET /api/status/applicant/{applicantId}.
export interface StatusModalProfileData {
  photo_path: string | null;
  application_id: string;
  status: ApplicationStatus | string;
  date_submitted: string | null;
  date_reviewed: string | null;
  full_name: string | null;
  sex: string | null;
  email: string | null;
  contact_number: string | null;
  application_type: "access-pass" | "vehicle-sticker";
  applicant_type: string | null; // shown as "Application Type" — access pass only
  plate_number: string | null; // shown as "Plate Number" — vehicle sticker only
}
