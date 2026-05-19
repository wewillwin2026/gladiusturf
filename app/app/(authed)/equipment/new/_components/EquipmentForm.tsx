"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/app/ui/Button";
import { Input, Textarea } from "@/components/app/ui/Input";
import { createEquipment } from "../actions";

const CATEGORIES = [
  { value: "truck", label: "Truck" },
  { value: "trailer", label: "Trailer" },
  { value: "tool", label: "Tool" },
  { value: "transformer", label: "Transformer" },
  { value: "meter", label: "Meter" },
  { value: "other", label: "Other" },
] as const;

const STATUSES = [
  { value: "available", label: "Available" },
  { value: "in_use", label: "In use" },
  { value: "maintenance", label: "Maintenance" },
  { value: "retired", label: "Retired" },
] as const;

const SELECT_CLASS =
  "mt-1.5 h-9 w-full rounded-md bg-g-surface border border-g-border px-3 text-[13px] text-g-text focus-visible:border-g-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-g-accent/30 disabled:opacity-50";

export function EquipmentForm() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("tool");
  const [status, setStatus] = React.useState("available");
  const [make, setMake] = React.useState("");
  const [model, setModel] = React.useState("");
  const [serialNo, setSerialNo] = React.useState("");
  const [assetTag, setAssetTag] = React.useState("");
  const [purchaseDate, setPurchaseDate] = React.useState("");
  const [notes, setNotes] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!name.trim()) {
      toast.error("Equipment name is required.");
      return;
    }
    setBusy(true);
    try {
      const res = await createEquipment({
        display_name: name,
        category,
        status,
        make: make || null,
        model: model || null,
        serial_no: serialNo || null,
        asset_tag: assetTag || null,
        purchase_date: purchaseDate || null,
        notes: notes || null,
      });
      if ("error" in res) {
        toast.error(
          res.error === "missing_name"
            ? "Equipment name is required."
            : "Could not save the equipment. Try again or email founders@gladiusturf.com.",
        );
        return;
      }
      toast.success(`Added ${name}`);
      router.push("/app/equipment");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
      <div className="g-card p-5 flex flex-col gap-4">
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Equipment name *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. T-104"
            autoFocus
            required
            className="mt-1.5"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={SELECT_CLASS}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={SELECT_CLASS}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="g-card p-5 flex flex-col gap-4">
        <h3 className="text-[14px] font-medium text-g-text">Details</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Make
            </label>
            <Input
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="Ford"
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Model
            </label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="F-250"
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Serial #
            </label>
            <Input
              value={serialNo}
              onChange={(e) => setSerialNo(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Asset tag
            </label>
            <Input
              value={assetTag}
              onChange={(e) => setAssetTag(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Purchase date
            </label>
            <Input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      <div className="g-card p-5">
        <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          Notes (optional)
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Front-line truck, assigned crew, anything you want a future you to remember."
          className="mt-1.5"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/app/equipment")}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={busy || !name.trim()}>
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Add equipment
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
