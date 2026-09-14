/**
 * Global "a new version is available" / "offline ready" banner.
 * The SMART Portal scaffold isn't a PWA yet (no vite-plugin-pwa / service
 * worker registered), so this is currently a no-op placeholder kept in the
 * App shell so wiring in real PWA support later is a one-file change.
 */
export function PWAUpdateToast() {
  return null;
}
