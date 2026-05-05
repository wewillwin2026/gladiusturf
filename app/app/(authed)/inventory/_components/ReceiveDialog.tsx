"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, ScanLine, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/app/ui/Dialog";
import { Button } from "@/components/app/ui/Button";
import { Input } from "@/components/app/ui/Input";
import BarcodeScannerDialog from "@/components/app/inventory/BarcodeScannerDialog";
import type { InventoryItemWithStats } from "@/lib/inventory/queries";
import { receiveUnits } from "../actions";

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  items: InventoryItemWithStats[];
}

// Random 4-char base32 suffix so suggested codes are short + scan-friendly.
function randomSuffix(): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < 4; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function suggestCode(sku: string): string {
  const cleaned = sku.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return `BL-INV-${cleaned}-${randomSuffix()}`;
}

export function ReceiveDialog({ open, onOpenChange, items }: Props) {
  const router = useRouter();
  const [step, setStep] = React.useState<"pick" | "scan">("pick");
  const [itemId, setItemId] = React.useState<string>("");
  const [search, setSearch] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [costInput, setCostInput] = React.useState("");
  const [codes, setCodes] = React.useState<string[]>([]);
  const [pending, setPending] = React.useState("");
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  // Reset every time the dialog flips closed.
  React.useEffect(() => {
    if (!open) {
      setStep("pick");
      setItemId("");
      setSearch("");
      setLocation("");
      setCostInput("");
      setCodes([]);
      setPending("");
      setScannerOpen(false);
      setBusy(false);
    }
  }, [open]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items.slice(0, 12);
    return items
      .filter(
        (i) =>
          i.sku.toLowerCase().includes(q) ||
          i.name.toLowerCase().includes(q) ||
          (i.brand ?? "").toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [items, search]);

  const selectedItem = items.find((i) => i.id === itemId) ?? null;

  function addCode(raw: string) {
    const code = raw.trim();
    if (!code) return;
    setCodes((prev) => (prev.includes(code) ? prev : [...prev, code]));
    setPending("");
  }

  function removeCode(code: string) {
    setCodes((prev) => prev.filter((c) => c !== code));
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    addCode(pending);
  }

  function handleSuggest() {
    if (!selectedItem) return;
    addCode(suggestCode(selectedItem.sku));
  }

  function handleScannerHit(code: string) {
    addCode(code);
    // Keep scanner open so receivers can scan a stack of boxes in a row.
  }

  async function handleSubmit() {
    if (!itemId || codes.length === 0 || busy) return;
    setBusy(true);
    try {
      const costCents = costInput.trim()
        ? Math.round(Number.parseFloat(costInput) * 100)
        : null;
      const res = await receiveUnits({
        itemId,
        qrCodes: codes,
        costCents:
          costCents != null && Number.isFinite(costCents) ? costCents : null,
        location: location.trim() || null,
      });
      if ("error" in res) {
        if (res.error === "all_duplicates") {
          toast.error("All codes already exist in inventory");
        } else if (res.error === "item_not_found_in_tenant") {
          toast.error("SKU not found");
        } else {
          toast.error("Could not receive units");
        }
        return;
      }
      toast.success(
        `Received ${res.insertedIds.length} unit${res.insertedIds.length === 1 ? "" : "s"} of ${selectedItem?.sku ?? "SKU"}`,
      );
      onOpenChange(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader
            title="Receive inventory"
            description={
              step === "pick"
                ? "Pick a SKU and optional cost / location."
                : `Scanning into ${selectedItem?.sku ?? "—"} · ${selectedItem?.name ?? ""}`
            }
          />

          {step === "pick" ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                  SKU
                </label>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search SKU, name, or brand"
                  autoFocus
                  className="mt-1.5"
                />
              </div>

              <div className="g-card max-h-[260px] overflow-y-auto divide-y divide-g-border-subtle">
                {filtered.length === 0 ? (
                  <div className="px-3 py-4 text-[13px] text-g-text-muted">
                    No SKUs match.
                  </div>
                ) : (
                  filtered.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setItemId(it.id)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-g-surface-2 transition-colors ${
                        itemId === it.id ? "bg-g-surface-2" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-geist-mono text-[12px] text-g-text">
                          {it.sku}
                        </div>
                        <div className="text-[12px] text-g-text-muted truncate">
                          {it.name}
                          {it.brand ? ` · ${it.brand}` : ""}
                        </div>
                      </div>
                      <div className="font-geist-mono tabular-nums text-[11px] text-g-text-faint">
                        {it.in_stock} on hand
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                    Unit cost ($, optional)
                  </label>
                  <Input
                    inputMode="decimal"
                    value={costInput}
                    onChange={(e) => setCostInput(e.target.value)}
                    placeholder={
                      selectedItem?.unit_cost_cents != null
                        ? (selectedItem.unit_cost_cents / 100).toFixed(2)
                        : "0.00"
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                    Location (optional)
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Warehouse A · Shelf 3"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  disabled={!itemId}
                  onClick={() => setStep("scan")}
                >
                  Next: scan codes
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="g-card p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
                    Codes to receive ({codes.length})
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleSuggest}
                    disabled={!selectedItem}
                  >
                    <Wand2 className="h-3 w-3" />
                    Suggest
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {codes.length === 0 ? (
                    <span className="text-[12px] text-g-text-muted">
                      Scan a box, type a code, or click Suggest.
                    </span>
                  ) : (
                    codes.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1 rounded-md bg-g-surface-2 px-2 py-1 font-geist-mono text-[11px] text-g-text"
                      >
                        {c}
                        <button
                          type="button"
                          onClick={() => removeCode(c)}
                          className="ml-1 text-g-text-faint hover:text-g-danger"
                          aria-label={`Remove ${c}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <Input
                  value={pending}
                  onChange={(e) => setPending(e.target.value)}
                  placeholder="Type or paste a code, then Enter"
                  autoComplete="off"
                  className="flex-1"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={!pending.trim()}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setScannerOpen(true)}
                >
                  <ScanLine className="h-3.5 w-3.5" />
                  Scan
                </Button>
              </form>

              <div className="flex justify-between gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("pick")}
                  disabled={busy}
                >
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    disabled={busy}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={busy || codes.length === 0}
                    onClick={handleSubmit}
                  >
                    {busy
                      ? "Receiving…"
                      : `Receive ${codes.length} unit${codes.length === 1 ? "" : "s"}`}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BarcodeScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleScannerHit}
      />
    </>
  );
}
