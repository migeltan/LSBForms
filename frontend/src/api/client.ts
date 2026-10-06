import axios from "axios";
import type { StatusLookupResult } from "../hooks/types"; // adjust path to your types file

/**
 * Base URL for the Laravel API. Set VITE_API_URL in frontend/.env to point
 * at your local `php artisan serve` (default http://localhost:8000/api).
 */
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "ngrok-skip-browser-warning": "1",
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
 * POST /status/lookup — reference number + the applicant's last name or
 * email. The backend answers with the same 404 whether the reference or the
 * second detail is wrong, so a wrong guess never confirms a reference exists.
 */
export async function lookupApplicationStatus(
  reference: string,
  identifier: string,
) {
  const res = await api.post<StatusLookupResult>("/status/lookup", {
    reference,
    identifier,
  });
  return res.data;
}
