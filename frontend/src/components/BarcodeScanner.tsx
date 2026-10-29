
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

    setCameraError(null);
    setReady(false);

    async function startScanner() {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();

        if (cancelled) return;

        if (devices.length === 0) {
          setCameraError(
            "No camera was found. Enter the product barcode manually instead.",
          );
          return;
        }

        const preferredCamera =
          devices.find((device) => /back|rear|environment/i.test(device.label)) ??
          devices[0];

        const video = videoRef.current;

        if (!video) return;

        const startedControls = await reader.decodeFromVideoDevice(
          preferredCamera.deviceId,
          video,
          (result) => {
            if (cancelled || !result) return;
            onDetectedRef.current(result.getText());
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
            "Camera access was denied. Allow camera permission in your browser, or enter the product barcode manually.",
          );
        } else if (
          name === "NotFoundError" ||
          name === "DevicesNotFoundError"
        ) {
          setCameraError(
            "No camera was found. Enter the product barcode manually instead.",
          );
        } else {
          setCameraError(
            "Couldn't start the camera. Check browser permissions and try again, or enter the product barcode manually.",
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
    <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl bg-ink sm:aspect-square">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        playsInline
        aria-label="Product barcode camera preview"
      />

      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center px-5 py-6 text-center sm:px-8">
          <p className="max-w-sm text-sm leading-6 text-paper/80">
            {cameraError}
          </p>
        </div>
      )}

      {!cameraError && !ready && (
        <div className="absolute inset-0 flex items-center justify-center px-5 text-center">
          <p className="text-sm text-paper/70" role="status">
            Starting camera...
          </p>
        </div>
      )}

      {ready && !paused && (
        <>
          <div className="pointer-events-none absolute inset-[10%] rounded-2xl border-2 border-lime/70" />
          <span className="scan-line" />
        </>
      )}
    </div>
  );
}
