"use client";

import * as React from "react";
import { startTracking } from "@/lib/tracking/client";

/**
 * Mounted once in the root layout. Boots the visitor/session/event tracker
 * client-side. Renders nothing.
 */
export function TrackingScript() {
  React.useEffect(() => {
    startTracking();
  }, []);
  return null;
}
