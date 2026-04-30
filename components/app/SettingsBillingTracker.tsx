"use client";

import * as React from "react";
import { track } from "@/lib/tracking/client";
import { type ProductKind } from "./engines";

export function SettingsBillingTracker({ product }: { product: ProductKind }) {
  React.useEffect(() => {
    track("settings_billing_view", { product });
  }, [product]);
  return null;
}
