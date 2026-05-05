"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ScanLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/app/ui/Button";
import BarcodeScannerDialog from "@/components/app/inventory/BarcodeScannerDialog";
import { lookupByQrCode, markUnitDeployed, markUnitDamaged } from "../actions";

type LookupResult = Awaited<ReturnType<typeof lookupByQrCode>>;

export function ScanButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function handleScan(code: string) {
    if (busy) return;
    setBusy(true);
    try {
      const res: LookupResult = await lookupByQrCode(code);
      if ("error" in res) {
        toast.error(
          res.error === "not_found"
            ? `No unit with code ${code}`
            : "Lookup failed",
        );
        return;
      }
      const unit = res.unit;
      toast.success(`${unit.sku} · ${unit.itemName} · ${unit.status}`, {
        description: `${unit.ageDays}d on shelf${unit.location ? ` · ${unit.location}` : ""}`,
        action:
          unit.status === "in_stock"
            ? {
                label: "Mark deployed",
                onClick: async () => {
                  const r = await markUnitDeployed(unit.id);
                  if ("error" in r) {
                    toast.error("Could not mark deployed");
                  } else {
                    toast.success(`${unit.sku} deployed`);
                    router.refresh();
                  }
                },
              }
            : undefined,
        cancel:
          unit.status === "in_stock"
            ? {
                label: "Mark damaged",
                onClick: async () => {
                  const r = await markUnitDamaged(unit.id);
                  if ("error" in r) {
                    toast.error("Could not mark damaged");
                  } else {
                    toast.success(`${unit.sku} flagged damaged`);
                    router.refresh();
                  }
                },
              }
            : undefined,
      });
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant="primary"
        size="md"
        onClick={() => setOpen(true)}
        disabled={busy}
      >
        <ScanLine className="h-3.5 w-3.5" />
        Scan
      </Button>
      <BarcodeScannerDialog
        open={open}
        onOpenChange={setOpen}
        onScan={handleScan}
      />
    </>
  );
}
