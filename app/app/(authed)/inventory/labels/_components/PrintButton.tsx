"use client";

import * as React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/app/ui/Button";

export function PrintButton() {
  return (
    <Button
      type="button"
      variant="primary"
      size="md"
      onClick={() => window.print()}
    >
      <Printer className="h-3.5 w-3.5" />
      Print sheet
    </Button>
  );
}
