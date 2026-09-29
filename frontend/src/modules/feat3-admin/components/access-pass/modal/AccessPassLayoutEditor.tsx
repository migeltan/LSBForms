import { useEffect, useMemo, useState } from "react";
import { Rnd } from "react-rnd";
import { api } from "../../../../../api/client";

type FieldKey = "photo" | "cn" | "name" | "department" | "signature";

/** Percent of the card (x/y = top-left, w/h = size). `font` is mm, text fields only. */
type Box = { x: number; y: number; w: number; h: number; font?: number };
type Layout = Record<FieldKey, Box>;

interface LayoutPayload {
  card: { widthMm: number; heightMm: number };
  defaults: Layout;
  layout: Layout;
  isCustomized: boolean;
  templateUrl: string;
  fontDataUri: string | null;
  content: {
    name: string;
    department: string;
    controlNumber: string;
    photoUrl: string | null;
    signatureUrl: string | null;
  };
}

const FIELDS: { key: FieldKey; label: string }[] = [
  { key: "photo", label: "Photo" },
  { key: "cn", label: "Control number" },
  { key: "name", label: "Name" },
  { key: "department", label: "Office" },
  { key: "signature", label: "Signature" },
];

const TEXT_FIELDS: FieldKey[] = ["cn", "name", "department"];
const MIN_FONT_MM = 1.5;
const MAX_FONT_MM = 15;
const CARD_PX_W = 380; // on-screen width of the card canvas
const SNAP_PX = 5;

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

export function AccessPassLayoutEditor({
  applicantId,
  onClose,
  onSaved,
}: {
  applicantId: number | string;
  onClose: () => void;
  /** Called after a successful save/reset so the caller can refresh its preview. */
  onSaved: () => void;
}) {
  const [data, setData] = useState<LayoutPayload | null>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [selected, setSelected] = useState<FieldKey>("name");
  const [snap, setSnap] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = `/admin/access-pass/${applicantId}/layout`;

  useEffect(() => {
    let cancelled = false;
    api
      .get<LayoutPayload>(endpoint)
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        setLayout(res.data.layout);
      })
      .catch(() => !cancelled && setError("Could not load the layout."));
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  const pxW = CARD_PX_W;
  const pxH = data ? (CARD_PX_W * data.card.heightMm) / data.card.widthMm : 0;
  const pxPerMm = data ? CARD_PX_W / data.card.widthMm : 0;

  const dirty = useMemo(
    () =>
      !!data &&
      !!layout &&
      JSON.stringify(layout) !== JSON.stringify(data.layout),
    [data, layout],
  );

  function patch(key: FieldKey, changes: Partial<Box>) {
    setLayout((prev) =>
      prev ? { ...prev, [key]: { ...prev[key], ...changes } } : prev,
    );
  }

  function nudge(e: React.KeyboardEvent) {
    if (!layout) return;
    const step = e.shiftKey ? 2 : 0.5;
    const b = layout[selected];
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    patch(selected, {
      x: clamp(b.x + m[0], 0, 100 - b.w),
      y: clamp(b.y + m[1], 0, 100 - b.h),
    });
  }

  async function save() {
    if (!layout) return;
    setBusy(true);
    setError(null);
    try {
      await api.put(endpoint, { layout });
      onSaved();
      onClose();
    } catch {
      setError("Could not save the layout. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resetToDefault() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.delete<LayoutPayload>(endpoint);
      setData(res.data);
      setLayout(res.data.layout);
      onSaved();
    } catch {
      setError("Could not reset the layout.");
    } finally {
      setBusy(false);
    }
  }

  function renderContent(key: FieldKey, b: Box) {
    if (!data) return null;
    const c = data.content;
    const fontSize = (b.font ?? 0) * pxPerMm;
    const textStyle = {
      fontSize,
      lineHeight: 1,
      whiteSpace: "nowrap" as const,
      color: "#1a1a1a",
    };

    switch (key) {
      case "photo":
        return c.photoUrl ? null : (
          <span className="text-[10px] text-gray-400">NO PHOTO</span>
        );
      case "cn":
        return (
          <span
            style={{
              ...textStyle,
              fontFamily: "Georgia, serif",
              fontWeight: 700,
            }}
          >
            {c.controlNumber}
          </span>
        );
      case "name":
        return (
          <span
            style={{
              ...textStyle,
              fontFamily: "'LSB Bebas', Impact, sans-serif",
              letterSpacing: 0.5,
            }}
          >
            {c.name}
          </span>
        );
      case "department":
        return (
          <span
            style={{
              ...textStyle,
              fontFamily: "'LSB Bebas', Impact, sans-serif",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {c.department}
          </span>
        );
      case "signature":
        return c.signatureUrl ? (
          <img
            src={c.signatureUrl}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-[10px] text-gray-400">Signature</span>
        );
    }
  }

  const grid: [number, number] = snap ? [SNAP_PX, SNAP_PX] : [1, 1];
  const sel = layout?.[selected];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[95vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">
            Adjust card layout
          </h2>
          <p className="text-sm text-gray-500">
            Drag a field to move it, drag its edges to resize. Arrow keys nudge
            the selected field.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-auto p-5 md:flex-row">
          {/* Canvas */}
          <div
            className="mx-auto shrink-0"
            tabIndex={0}
            onKeyDown={nudge}
            style={{ outline: "none" }}
          >
            {!layout || !data ? (
              <div
                className="flex items-center justify-center text-sm text-gray-500"
                style={{ width: pxW, height: 520 }}
              >
                {error ?? "Loading…"}
              </div>
            ) : (
              <div
                className="relative overflow-hidden shadow ring-1 ring-gray-300"
                style={{
                  width: pxW,
                  height: pxH,
                  backgroundImage: `url(${data.templateUrl})`,
                  backgroundSize: "100% 100%",
                }}
                onMouseDown={(e) =>
                  e.target === e.currentTarget &&
                  e.currentTarget.parentElement?.focus()
                }
              >
                {data.fontDataUri && (
                  <style>{`@font-face{font-family:'LSB Bebas';src:url(${data.fontDataUri}) format('truetype');}`}</style>
                )}

                {FIELDS.map(({ key }) => {
                  const b = layout[key];
                  const isSel = key === selected;
                  return (
                    <Rnd
                      key={key}
                      bounds="parent"
                      size={{
                        width: (b.w / 100) * pxW,
                        height: (b.h / 100) * pxH,
                      }}
                      position={{ x: (b.x / 100) * pxW, y: (b.y / 100) * pxH }}
                      dragGrid={grid}
                      resizeGrid={grid}
                      lockAspectRatio={key === "photo"}
                      onDragStart={() => setSelected(key)}
                      onResizeStart={() => setSelected(key)}
                      onDragStop={(_e, d) =>
                        patch(key, {
                          x: (d.x / pxW) * 100,
                          y: (d.y / pxH) * 100,
                        })
                      }
                      onResizeStop={(_e, _dir, ref, _delta, pos) => {
                        const nw = ref.offsetWidth;
                        const nh = ref.offsetHeight;
                        const changes: Partial<Box> = {
                          x: (pos.x / pxW) * 100,
                          y: (pos.y / pxH) * 100,
                          w: (nw / pxW) * 100,
                          h: (nh / pxH) * 100,
                        };
                        // Text scales with the box height so it never reflows unpredictably.
                        if (b.font) {
                          changes.font = clamp(
                            b.font * (changes.h! / b.h),
                            MIN_FONT_MM,
                            MAX_FONT_MM,
                          );
                        }
                        patch(key, changes);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          key === "photo" || key === "signature"
                            ? "center"
                            : "flex-start",
                        overflow: "hidden",
                        cursor: "move",
                        outline: isSel
                          ? "2px solid #2563eb"
                          : "1px dashed rgba(37,99,235,0.45)",
                        background:
                          key === "photo"
                            ? data.content.photoUrl
                              ? `center / cover url(${data.content.photoUrl})`
                              : "#eef1f5"
                            : "rgba(37,99,235,0.04)",
                        borderRadius: key === "photo" ? 4 : 0,
                        zIndex: isSel ? 10 : 1,
                      }}
                    >
                      {renderContent(key, b)}
                    </Rnd>
                  );
                })}
              </div>
            )}
          </div>

          {/* Side panel */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Field</p>
              <div className="flex flex-wrap gap-2">
                {FIELDS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelected(key)}
                    className={`rounded-md px-3 py-1.5 text-sm ring-1 transition ${
                      key === selected
                        ? "bg-blue-600 text-white ring-blue-600"
                        : "bg-white text-gray-700 ring-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {sel &&
              TEXT_FIELDS.includes(selected) &&
              sel.font !== undefined && (
                <label className="block text-sm text-gray-700">
                  Text size (mm)
                  <input
                    type="number"
                    step={0.1}
                    min={MIN_FONT_MM}
                    max={MAX_FONT_MM}
                    value={Number(sel.font.toFixed(1))}
                    onChange={(e) =>
                      patch(selected, {
                        font: clamp(
                          Number(e.target.value) || MIN_FONT_MM,
                          MIN_FONT_MM,
                          MAX_FONT_MM,
                        ),
                      })
                    }
                    className="mt-1 block w-28 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </label>
              )}

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={snap}
                onChange={(e) => setSnap(e.target.checked)}
              />
              Snap to grid
            </label>

            <button
              type="button"
              onClick={resetToDefault}
              disabled={busy || !data?.isCustomized}
              className="self-start rounded-md px-3 py-1.5 text-sm text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 disabled:opacity-40"
            >
              Reset to default layout
            </button>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy || !dirty}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save layout"}
          </button>
        </div>
      </div>
    </div>
  );
}
