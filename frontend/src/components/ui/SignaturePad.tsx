import { useEffect, useRef, useState, type PointerEvent } from "react";
import { CheckCircle2, Eraser, Pencil, Upload } from "lucide-react";

interface Props {
  /** PNG data URL, or "" when empty. */
  value: string;
  onChange: (dataUrl: string) => void;
}

const PAD_HEIGHT = 176;
const UPLOAD_MAX_WIDTH = 600;
const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
) {
  const s = Math.min(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

/** Otsu's method: picks the brightness cut-off that best separates ink from paper. */
function otsu(hist: number[], total: number): number {
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0,
    wB = 0,
    best = 0,
    thr = 127;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) ** 2;
    if (between > best) {
      best = between;
      thr = t;
    }
  }
  return thr;
}

/** Turns a photo/scan of a signature into a tightly-cropped transparent PNG. */
function cleanSignature(img: HTMLImageElement): string | null {
  const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;

  // Already a transparent PNG? Keep its alpha and just crop.
  let seeThrough = 0;
  for (let i = 3; i < px.length; i += 4) if (px[i] < 250) seeThrough++;
  const hasAlpha = seeThrough > w * h * 0.05;

  if (!hasAlpha) {
    const hist = new Array(256).fill(0);
    const gray = new Uint8ClampedArray(w * h);
    for (let i = 0, p = 0; i < px.length; i += 4, p++) {
      const g = Math.round(
        0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2],
      );
      gray[p] = g;
      hist[g]++;
    }
    const thr = otsu(hist, w * h);
    const soft = 24; // feathered edge so strokes stay smooth
    for (let i = 0, p = 0; i < px.length; i += 4, p++) {
      const a = Math.max(0, Math.min(1, (thr + soft / 2 - gray[p]) / soft));
      px[i] = 15;
      px[i + 1] = 23;
      px[i + 2] = 42; // slate-900 ink
      px[i + 3] = Math.round(a * 255);
    }
  }

  // Bounding box of the ink (ignoring a thin border, where shadows creep in).
  const mx = Math.round(w * 0.015);
  const my = Math.round(h * 0.015);
  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1,
    ink = 0;
  for (let y = my; y < h - my; y++) {
    for (let x = mx; x < w - mx; x++) {
      if (px[(y * w + x) * 4 + 3] > 128) {
        ink++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (ink < 40 || ink / (w * h) > 0.35) return null; // nothing found, or all shadow

  ctx.putImageData(data, 0, 0);
  const pad = Math.round(Math.max(w, h) * 0.02) + 4;
  const sx = Math.max(0, minX - pad);
  const sy = Math.max(0, minY - pad);
  const sw = Math.min(w, maxX + pad) - sx;
  const sh = Math.min(h, maxY + pad) - sy;

  const s = Math.min(1, UPLOAD_MAX_WIDTH / sw);
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(sw * s));
  out.height = Math.max(1, Math.round(sh * s));
  out
    .getContext("2d")!
    .drawImage(c, sx, sy, sw, sh, 0, 0, out.width, out.height);
  return out.toDataURL("image/png");
}

export function SignaturePad({ value, onChange }: Props) {
  const [mode, setMode] = useState<"draw" | "upload">("draw");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const lastWidth = useRef(0);
  const valueRef = useRef(value);
  valueRef.current = value;

  function setupCanvas() {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const { width } = c.getBoundingClientRect();
    if (width === 0) return; // step is hidden; the observer re-runs this when it's shown
    lastWidth.current = width;
    c.width = Math.round(width * dpr);
    c.height = Math.round(PAD_HEIGHT * dpr);
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
    if (valueRef.current) {
      const img = new Image();
      img.onload = () => drawContain(ctx, img, width, PAD_HEIGHT);
      img.src = valueRef.current;
    }
  }

  function clearCanvas() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.restore();
  }

  // Size the canvas whenever it actually becomes visible or changes width
  // (step un-hidden, tab switched back to Draw, screen rotated).
  useEffect(() => {
    const c = canvasRef.current;
    if (mode !== "draw" || !c) return;
    lastWidth.current = 0;
    const ro = new ResizeObserver(() => {
      const w = c.getBoundingClientRect().width;
      if (w > 0 && Math.abs(w - lastWidth.current) > 1) setupCanvas();
    });
    ro.observe(c);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Parent reset (after submit) or Clear button.
  useEffect(() => {
    if (!value) clearCanvas();
  }, [value]);

  function point(e: PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onDown(e: PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = point(e);
    last.current = p;
    const ctx = e.currentTarget.getContext("2d")!;
    ctx.beginPath(); // a single tap leaves a dot
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.01, p.y);
    ctx.stroke();
  }

  function onMove(e: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const p = point(e);
    const ctx = e.currentTarget.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  }

  function onUp() {
    if (!drawing.current) return;
    drawing.current = false;
    const c = canvasRef.current;
    if (c && c.width > 0) onChange(c.toDataURL("image/png"));
  }

  function handleFile(file: File | undefined) {
    setUploadError(null);
    if (!file) return;
    if (!/^image\/(png|jpeg)$/.test(file.type)) {
      setUploadError("Please upload a PNG or JPG image.");
      return;
    }
    if (file.size > UPLOAD_MAX_BYTES) {
      setUploadError("Image must be 5 MB or smaller.");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const cleaned = cleanSignature(img);
      URL.revokeObjectURL(url);
      if (cleaned) onChange(cleaned);
      else
        setUploadError(
          "We couldn't find a clear signature in that image. Use dark ink on plain light paper with even lighting, or draw it instead.",
        );
    };
    img.onerror = () => {
      setUploadError("That image couldn't be read.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  const tab = (m: "draw" | "upload") =>
    `inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
      mode === m
        ? "bg-white text-[var(--smart-blue-dark)] shadow-sm"
        : "text-slate-500 hover:text-slate-700"
    }`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div role="tablist" className="inline-flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "draw"}
            onClick={() => setMode("draw")}
            className={tab("draw")}
          >
            <Pencil size={13} /> Draw
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "upload"}
            onClick={() => setMode("upload")}
            className={tab("upload")}
          >
            <Upload size={13} /> Upload
          </button>
        </div>

        <div className="flex items-center gap-3">
          {value && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <CheckCircle2 size={14} /> Signature captured
            </span>
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={!value}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600 disabled:opacity-40"
          >
            <Eraser size={13} /> Clear
          </button>
        </div>
      </div>

      {mode === "draw" ? (
        <div className="relative mt-3">
          <canvas
            ref={canvasRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            style={{ height: PAD_HEIGHT }}
            className="w-full cursor-crosshair touch-none rounded-lg border-2 border-dashed border-slate-300 bg-slate-50"
          />
          {!value && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs italic text-slate-400">
              Sign here using your mouse, finger, or stylus
            </span>
          )}
        </div>
      ) : value ? (
        <div
          className="mt-3 flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-3"
          style={{ height: PAD_HEIGHT }}
        >
          <img
            src={value}
            alt="Signature preview"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ) : (
        <label
          className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-center transition hover:border-blue-500 hover:bg-blue-50/50"
          style={{ height: PAD_HEIGHT }}
        >
          <Upload size={20} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">
            Upload your e-signature
          </span>
          <span className="text-xs text-slate-500">
            PNG or JPG, up to 5 MB. Photos on white paper are cleaned and
            cropped automatically.
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      )}

      {uploadError && (
        <p className="mt-2 text-xs text-red-600">{uploadError}</p>
      )}
    </div>
  );
}
