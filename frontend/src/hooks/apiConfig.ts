// export const BASE = "http://localhost:8000";
// export const STORAGE_BASE = `${BASE}/storage`;

export const BASE =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ??
  "http://backend.test";
export const STORAGE_BASE = `${BASE}/storage`;
