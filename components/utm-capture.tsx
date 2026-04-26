"use client";

import { useEffect } from "react";
import { captureFirstTouchUtm } from "@/lib/track";

/** Fires once on mount to persist first-touch attribution. */
export function UtmCapture() {
  useEffect(() => {
    captureFirstTouchUtm();
  }, []);
  return null;
}
