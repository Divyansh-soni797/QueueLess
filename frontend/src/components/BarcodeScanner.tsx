
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  paused?: boolean;
}

export default function BarcodeScanner({
  onDetected,
  paused = false,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const onDetectedRef = useRef(onDetected);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    if (paused) return;

    let cancelled = false;
    let controls: IScannerControls | null = null;



    const reader = new BrowserMultiFormatReader();

    async function startScanner() {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();

        if (cancelled) return;

        if (devices.length === 0) {
          setCameraError(
            "No camera was found. Enter the receipt token manually below.",
          );
          return;
        }

        const preferredCamera =
          devices.find((device) => /back|rear|environment/i.test(device.label)) ??
          devices[0];

        const startedControls = await reader.decodeFromVideoDevice(
          preferredCamera.deviceId,
          videoRef.current!,
          (result) => {
            if (cancelled) return;

            if (result) {
              onDetectedRef.current(result.getText());
            }
          },
        );

        if (cancelled) {
          startedControls.stop();
          return;
        }

        controls = startedControls;
        controlsRef.current = startedControls;
        setReady(true);
      } catch (error: unknown) {
        if (cancelled) return;

        const name = error instanceof Error ? error.name : "";

        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setCameraError(
            "Camera access was denied. Allow camera permission in your browser, or enter the receipt token manually.",
          );
        } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
          setCameraError(
            "No camera was found. Enter the receipt token manually below.",
          );
        } else {
          setCameraError(
            "Couldn't start the camera. Check browser permissions and try again, or enter the receipt token manually.",
          );
        }
      }
    }

    void startScanner();

    return () => {
      cancelled = true;
      controls?.stop();
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [paused]);

  return (
    <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-ink">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
      />

      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
          <p className="text-paper/80 text-sm">{cameraError}</p>
        </div>
      )}

      {!cameraError && !ready && (
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
          <p className="text-paper/70 text-sm">Starting camera…</p>
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
