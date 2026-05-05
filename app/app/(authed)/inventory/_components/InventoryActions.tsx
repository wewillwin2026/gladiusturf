"use client";

import * as React from "react";
import Link from "next/link";
import { PackagePlus, Printer } from "lucide-react";
import { Button } from "@/components/app/ui/Button";
import type { InventoryItemWithStats } from "@/lib/inventory/queries";
import { ScanButton } from "./ScanButton";
import { ReceiveDialog } from "./ReceiveDialog";

export function InventoryActions({
  items,
}: {
  items: InventoryItemWithStats[];
}) {
  const [receiveOpen, setReceiveOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-2">
      <Link href="/app/inventory/labels" prefetch>
        <Button variant="ghost" size="md" type="button">
          <Printer className="h-3.5 w-3.5" />
          Labels
        </Button>
      </Link>
      <Button
        variant="secondary"
        size="md"
        type="button"
        onClick={() => setReceiveOpen(true)}
      >
        <PackagePlus className="h-3.5 w-3.5" />
        Receive
      </Button>
      <ScanButton />
      <ReceiveDialog
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
        items={items}
      />
    </div>
  );
}
