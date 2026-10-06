import { BASE } from "../hooks/apiConfig";

/**
 * ngrok's free tunnel answers browser requests with an HTML "Visit Site"
 * warning page unless the request carries `ngrok-skip-browser-warning`.
 * axios (src/api/client.ts) already sends it, but the admin screens call the
 * API with plain fetch(), so they received HTML instead of JSON and showed
 * "Could not load ... applications".
 *
 * This adds the header to every fetch() aimed at the backend, so all call
 * sites are fixed in one place. Requests to other hosts are left alone.
 * It is harmless on a normal (non-ngrok) backend.
 */
const nativeFetch = window.fetch.bind(window);

window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  if (!url.startsWith(BASE)) return nativeFetch(input, init);

  const headers = new Headers(
    init?.headers ?? (input instanceof Request ? input.headers : undefined),
  );
  if (!headers.has("ngrok-skip-browser-warning")) {
    headers.set("ngrok-skip-browser-warning", "1");
  }
  return nativeFetch(input, { ...init, headers });
};
