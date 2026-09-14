import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const REFERENCE_PATTERN = /^(AP|VS)-\d{4}-\d{5}$/i;

interface ApplicationStatus {
  reference: string;
  type: string;
  stage: string;
  updatedAt: string;
}

type LookupState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: ApplicationStatus };

export function StatusQrScan() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported] = useState(() => typeof window !== 'undefined' && 'BarcodeDetector' in window);
  const [lookup, setLookup] = useState<LookupState>({ status: 'idle' });

  useEffect(() => stopScanning, []); // eslint-disable-line react-hooks/exhaustive-deps

  function stopScanning() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  }

  async function startScanning() {
    setError(null);
    setLookup({ status: 'idle' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      detectLoop();
    } catch {
      setError('Camera access was denied or unavailable.');
    }
  }

  function detectLoop() {
    const BarcodeDetectorCtor = (window as any).BarcodeDetector;
    if (!BarcodeDetectorCtor || !videoRef.current) return;
    const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] });

    const tick = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      try {
        const codes = await detector.detect(videoRef.current);
        if (codes.length > 0) {
          stopScanning();
          fetchStatus(codes[0].rawValue);
          return;
        }
      } catch {
        // transient decode error, keep trying
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  async function fetchStatus(raw: string) {
    const clean = raw.trim().toUpperCase();

    if (!REFERENCE_PATTERN.test(clean)) {
      setLookup({
        status: 'error',
        message: `The scanned code ("${raw}") isn't a valid reference number.`,
      });
      return;
    }

    setLookup({ status: 'loading' });
    try {
      const res = await fetch(`/api/status/${clean}`);
      if (!res.ok) {
        throw new Error(
          res.status === 404
            ? 'No application found with that reference number.'
            : 'Something went wrong while checking your status.'
        );
      }
      const data = (await res.json()) as ApplicationStatus;
      setLookup({ status: 'success', data });
    } catch (err) {
      setLookup({
        status: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong while checking your status.',
      });
    }
  }

  return (
    <>
      <div className="form-section-card corner-accent-blue mx-auto max-w-xl">
        <div className="section-label">Scan Receipt</div>
        <h2>QR Code Scanner</h2>
        <p className="text-[var(--smart-muted)]">
          Point your camera at the QR code on your application receipt.
        </p>

        <div className="qr-scan-frame mt-3">
          <video ref={videoRef} className={`qr-scan-video${scanning ? ' is-active' : ''}`} muted playsInline />
          {!scanning && (
            <div className="qr-scan-placeholder">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h3v3h-3zM19 14v3M14 19h2M19 19h2v2h-2z" />
              </svg>
              <span>Camera preview appears here</span>
            </div>
          )}
        </div>

        {!supported && (
          <p className="mt-2 mb-0 text-sm text-[var(--smart-muted)]">
            This browser doesn't support in-page QR scanning —{' '}
            <Link to="/status/search">search by reference number instead</Link>.
          </p>
        )}
        {error && (
          <p className="mt-2 mb-0 text-sm" style={{ color: 'var(--smart-red, #b3261e)' }}>
            {error}
          </p>
        )}

        <div className="mt-3 flex items-center gap-3">
          {scanning ? (
            <button type="button" className="btn btn-govt-outline btn-sm" onClick={stopScanning}>
              Stop Scanning
            </button>
          ) : (
            <button type="button" className="btn btn-govt-primary btn-sm" onClick={startScanning} disabled={!supported}>
              Start Camera
            </button>
          )}
          <Link to="/status" className="text-sm text-[var(--smart-muted)]">
            ‹ Back
          </Link>
        </div>
      </div>

      {lookup.status !== 'idle' && (
        <div className="form-section-card corner-accent-yellow mx-auto mt-4 max-w-xl">
          {lookup.status === 'loading' && (
            <p className="mb-0 text-sm text-[var(--smart-muted)]">Checking your application status…</p>
          )}
          {lookup.status === 'error' && (
            <p className="mb-0 text-sm" style={{ color: 'var(--smart-red, #b3261e)' }}>
              {lookup.message}
            </p>
          )}
          {lookup.status === 'success' && (
            <>
              <div className="section-label">Result</div>
              <h2 style={{ fontSize: '1.1rem' }}>{lookup.data.reference}</h2>
              <p className="mb-0 text-sm text-[var(--smart-muted)]">
                {lookup.data.type} — currently {lookup.data.stage}. Last updated {lookup.data.updatedAt}.
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}
