import axios from "axios";
import type {
  ApplicationSearchParams,
  ApplicationSearchRow,
  ApplicationStatusLookup,
  StatusModalProfileData,
} from "../hooks/types"; // adjust path to your types file

/**
 * Base URL for the Laravel API. Set VITE_API_URL in frontend/.env to point
 * at your local `php artisan serve` (default http://localhost:8000/api).
 */
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("smart_portal_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * GET /status/{reference} — exact reference-number lookup.
 */
export async function fetchApplicationStatus(reference: string) {
  const res = await api.get<ApplicationStatusLookup>(`/status/${reference}`);
  return res.data;
}

/**
 * GET /applications/search — name / application-id / type / date / status
 * filters, all optional and independently combinable
 * (feat4-check-status/StatusSearch.tsx).
 */
export async function searchApplications(params: ApplicationSearchParams) {
  const res = await api.get<ApplicationSearchRow[]>("/applications/search", {
    params: {
      name: params.name,
      application_id: params.applicationId,
      type: params.type,
      date: params.date,
      status: params.status,
    },
  });
  return res.data;
}

/**
 * GET /status/applicant/{applicantId} — lean profile for the row-click
 * modal on the Status page (StatusModalProfile.tsx). `type` disambiguates
 * which table to look the applicant up in, since access-pass and
 * vehicle-sticker applicants are separate records.
 */
export async function fetchStatusApplicantProfile(
  applicantId: number | string,
  type: "access-pass" | "vehicle-sticker"
) {
  const res = await api.get<StatusModalProfileData>(
    `/status/applicant/${applicantId}`,
    { params: { type } }
  );
  return res.data;
}
