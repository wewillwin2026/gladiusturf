"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Wrench } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/app/ui/Dialog";
import { Button } from "@/components/app/ui/Button";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import AgeBadge from "@/components/app/inventory/AgeBadge";
import { shortDate } from "@/lib/shared/format";
import type { InventoryItemWithStats } from "@/lib/inventory/queries";
import { ageInDays } from "@/lib/inventory/aging";
import { markUnitDamaged, markUnitDeployed } from "../actions";

// Reuse the same status → tone map across all unit lists. Keep aligned
// with the migration's CHECK constraint.
const STATUS_TONE: Record<string, Tone> = {
  in_stock: "accent",
  reserved: "info",
  deployed: "success",
  damaged: "danger",
  returned: "warning",
  lost: "danger",
};

type Props = {
  item: InventoryItemWithStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UnitDrawer({ item, open, onOpenChange }: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function handleDeploy(unitId: string) {
    setPendingId(unitId);
    const result = await markUnitDeployed(unitId);
    setPendingId(null);
    if ("error" in result) {
      toast.error(`Couldn't mark deployed: ${result.error}`);
      return;
    }
    toast.success("Unit marked deployed.");
    router.refresh();
  }

  async function handleDamage(unitId: string) {
    setPendingId(unitId);
    const result = await markUnitDamaged(unitId);
    setPendingId(null);
    if ("error" in result) {
      toast.error(`Couldn't flag damage: ${result.error}`);
      return;
    }
    toast.success("Unit flagged as damaged.");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader
          title={item?.name ?? "Unit detail"}
          description={
            item
              ? `${item.sku} · ${item.units.length} unit${
                  item.units.length === 1 ? "" : "s"
                } on file`
              : undefined
          }
        />

        {item && item.units.length > 0 ? (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left border-b border-g-border-subtle text-g-text-faint">
                  <th className="px-2 py-2 font-medium uppercase tracking-[0.14em] text-[10px]">
                    QR
                  </th>
                  <th className="px-2 py-2 font-medium uppercase tracking-[0.14em] text-[10px]">
                    Location
                  </th>
                  <th className="px-2 py-2 font-medium uppercase tracking-[0.14em] text-[10px]">
                    Status
                  </th>
                  <th className="px-2 py-2 font-medium uppercase tracking-[0.14em] text-[10px]">
                    Age
                  </th>
                  <th className="px-2 py-2 font-medium uppercase tracking-[0.14em] text-[10px]">
                    Received
                  </th>
                  <th className="px-2 py-2 font-medium uppercase tracking-[0.14em] text-[10px] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {item.units.map((u) => {
                  const isPending = pendingId === u.id;
                  const isInStock = u.status === "in_stock";
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-g-border-subtle/50 last:border-b-0"
                    >
                      <td className="px-2 py-2 font-geist-mono text-g-text-muted">
                        {u.qr_code}
                      </td>
                      <td className="px-2 py-2 text-g-text-muted">
                        {u.location ?? "—"}
                      </td>
                      <td className="px-2 py-2">
                        <StatusPill tone={STATUS_TONE[u.status] ?? "neutral"}>
                          {u.status.replace("_", " ")}
                        </StatusPill>
                      </td>
                      <td className="px-2 py-2">
                        <AgeBadge days={ageInDays(u.received_at)} />
                      </td>
                      <td className="px-2 py-2 font-geist-mono text-g-text-faint">
                        {shortDate(u.received_at)}
                      </td>
                      <td className="px-2 py-2 text-right">
                        {isInStock ? (
                          <div className="inline-flex items-center gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={isPending}
                              onClick={() => handleDeploy(u.id)}
                            >
                              {isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              Deployed
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={isPending}
                              onClick={() => handleDamage(u.id)}
                            >
                              <Wrench className="h-3 w-3" />
                              Damaged
                            </Button>
                          </div>
                        ) : (
                          <span className="text-g-text-faint">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[13px] text-g-text-muted">
            No units on file for this SKU.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
