"use client";

import * as React from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { toast } from "sonner";
import { Camera, Loader2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/app/ui/Dialog";
import { Button } from "@/components/app/ui/Button";
import { Input } from "@/components/app/ui/Input";

type ScannerState =
  | { kind: "idle" }
  | { kind: "requesting" }
  | { kind: "scanning" }
  | { kind: "decoded"; code: string }
  | { kind: "error"; message: string };

export interface BarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  onScan: (code: string) => void | Promise<void>;
}

export default function BarcodeScannerDialog({
  open,
  onOpenChange,
  onScan,
}: BarcodeScannerDialogProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const controlsRef = React.useRef<IScannerControls | null>(null);
  const readerRef = React.useRef<BrowserMultiFormatReader | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = React.useState<ScannerState>({ kind: "idle" });
  const [showSlowHint, setShowSlowHint] = React.useState(false);
  const [manualCode, setManualCode] = React.useState("");
  const [retryNonce, setRetryNonce] = React.useState(0);

  const stopCamera = React.useCallback(() => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch {
        // ignore
      }
      controlsRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowSlowHint(false);
  }, []);

  // Boot/teardown camera lifecycle keyed on `open` + `retryNonce`.
  React.useEffect(() => {
    if (!open) {
      stopCamera();
      setState({ kind: "idle" });
      return;
    }

    let cancelled = false;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    setState({ kind: "requesting" });

    (async () => {
      try {
        // Prefer rear ("environment") camera for tablets / phones.
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (cancelled) return;

        let deviceId: string | undefined;
        const rear = devices.find((d) =>
          /back|rear|environment/i.test(d.label),
        );
        if (rear) {
          deviceId = rear.deviceId;
        } else if (devices.length > 0) {
          // Fallback: last device tends to be rear on mobile.
          deviceId = devices[devices.length - 1]?.deviceId;
        }

        const video = videoRef.current;
        if (!video) {
          throw new Error("Video element unavailable");
        }

        const controls = await reader.decodeFromVideoDevice(
          deviceId,
          video,
          (result) => {
            if (!result) return;
            const text = result.getText();
            setState({ kind: "decoded", code: text });
            try {
              controls.stop();
            } catch {
              // ignore
            }
            controlsRef.current = null;
            void Promise.resolve(onScan(text));
          },
        );
        if (cancelled) {
          try {
            controls.stop();
          } catch {
            // ignore
          }
          return;
        }
        controlsRef.current = controls;
        setState({ kind: "scanning" });

        // 30s slow-scan hint.
        timeoutRef.current = setTimeout(() => {
          setShowSlowHint(true);
        }, 30_000);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Camera permission denied. Use manual entry below or grant access in your browser settings."
            : err instanceof DOMException && err.name === "NotFoundError"
              ? "No camera found on this device. Use manual entry below."
              : err instanceof Error
                ? err.message
                : "Couldn't start the camera.";
        setState({ kind: "error", message });
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          toast.error("Camera permission denied");
        }
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, retryNonce, stopCamera, onScan]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    void Promise.resolve(onScan(code));
    setManualCode("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader
          title="Scan unit"
          description="Point your camera at the unit's QR code, or type the code manually."
        />

        <div className="flex flex-col gap-3">
          {/* Camera preview */}
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full aspect-video rounded-md bg-black"
              playsInline
              muted
            />
            {state.kind !== "scanning" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-black/60 text-center text-[12px] text-g-text-muted">
                {state.kind === "requesting" && (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-g-accent" />
                    <span>Requesting camera…</span>
                  </>
                )}
                {state.kind === "decoded" && (
                  <>
                    <Camera className="h-5 w-5 text-g-accent" />
                    <span className="font-geist-mono tabular-nums text-g-text">
                      {state.code}
                    </span>
                  </>
                )}
                {state.kind === "error" && (
                  <>
                    <Camera className="h-5 w-5 text-g-danger" />
                    <span className="px-4 text-g-danger">{state.message}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setRetryNonce((n) => n + 1)}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Retry
                    </Button>
                  </>
                )}
                {state.kind === "idle" && (
                  <span>Camera off.</span>
                )}
              </div>
            )}
          </div>

          {showSlowHint && state.kind === "scanning" && (
            <div className="rounded-md border border-g-border-subtle bg-g-surface-2 px-3 py-2 text-[12px] text-g-text-muted">
              Hold the QR code closer or enter manually.
            </div>
          )}

          {/* Manual entry */}
          <form
            onSubmit={handleManualSubmit}
            className="flex flex-col gap-1.5"
          >
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Manual entry
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="BL-INV-CPL11-A1"
                className="flex-1"
                autoComplete="off"
              />
              <Button type="submit" variant="primary" disabled={!manualCode.trim()}>
                Look up
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
