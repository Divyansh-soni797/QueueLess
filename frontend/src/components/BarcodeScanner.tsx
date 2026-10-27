import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  paused?: boolean;
}

export default function BarcodeScanner({ onDetected, paused = false }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (paused) return;

    let cancelled = false;
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result) => {
        if (result && !cancelled) {
          onDetected(result.getText());
        }
      })
      .then((controls) => {
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setReady(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error && err.name === "NotAllowedError"
            ? "Camera access was denied. Allow camera access, or enter the barcode manually below."
            : "Couldn't access a camera on this device. Enter the barcode manually below.";
        setCameraError(message);
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  return (
    <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-ink">
      {!cameraError && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          playsInline
        />
      )}

      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
          <p className="text-paper/80 text-sm">{cameraError}</p>
        </div>
      )}

      {ready && !paused && (
        <>
          <div className="absolute inset-6 border-2 border-lime/70 rounded-2xl" />
          <span className="scan-line" />
        </>
      )}
    </div>
  );
}
