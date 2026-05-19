"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/app/ui/Button";
import { Input, Textarea } from "@/components/app/ui/Input";
import { createInventoryItem } from "../actions";

const CATEGORIES = [
  { value: "fixture", label: "Fixture" },
  { value: "transformer", label: "Transformer" },
  { value: "wire", label: "Wire" },
  { value: "controller", label: "Controller" },
  { value: "sensor", label: "Sensor" },
  { value: "accessory", label: "Accessory" },
  { value: "other", label: "Other" },
] as const;

const UNITS = [
  { value: "each", label: "each" },
  { value: "ft", label: "feet" },
  { value: "box", label: "box" },
  { value: "roll", label: "roll" },
] as const;

const SELECT_CLASS =
  "mt-1.5 h-9 w-full rounded-md bg-g-surface border border-g-border px-3 text-[13px] text-g-text focus-visible:border-g-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-g-accent/30 disabled:opacity-50";

export function InventoryForm() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [name, setName] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [category, setCategory] = React.useState("fixture");
  const [brand, setBrand] = React.useState("");
  const [unit, setUnit] = React.useState("each");
  const [unitCost, setUnitCost] = React.useState("");
  const [unitPrice, setUnitPrice] = React.useState("");
  const [parLevel, setParLevel] = React.useState("");
  const [description, setDescription] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!name.trim()) {
      toast.error("Item name is required.");
      return;
    }
    if (!sku.trim()) {
      toast.error("SKU is required.");
      return;
    }
    setBusy(true);
    try {
      const res = await createInventoryItem({
        sku,
        name,
        category,
        brand: brand || null,
        unit,
        unit_cost_dollars: unitCost ? Number(unitCost) : null,
        unit_price_dollars: unitPrice ? Number(unitPrice) : null,
        par_level: parLevel ? Number(parLevel) : null,
        description: description || null,
      });
      if ("error" in res) {
        toast.error(
          res.error === "missing_name"
            ? "Item name is required."
            : res.error === "missing_sku"
              ? "SKU is required."
              : res.error === "duplicate_sku"
                ? "That SKU already exists."
                : "Could not save the item. Try again or email founders@gladiusturf.com.",
        );
        return;
      }
      toast.success(`Added ${name}`);
      router.push("/app/inventory");
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
            Item name *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VOLT G4 LED · warm white · 3W"
            autoFocus
            required
            className="mt-1.5"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              SKU *
            </label>
            <Input
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              placeholder="VOLT-G4-3W"
              required
              className="mt-1.5 font-mono"
            />
          </div>
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
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Brand
            </label>
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="VOLT, Cast, Unique, etc."
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Unit *
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className={SELECT_CLASS}
            >
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="g-card p-5 flex flex-col gap-4">
        <h3 className="text-[14px] font-medium text-g-text">
          Cost &amp; stocking
        </h3>
        <div className="grid gap-4 grid-cols-3">
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Unit cost ($)
            </label>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              placeholder="48.00"
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Unit price ($)
            </label>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="89.00"
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Par level
            </label>
            <Input
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              value={parLevel}
              onChange={(e) => setParLevel(e.target.value)}
              placeholder="12"
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      <div className="g-card p-5">
        <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          Description (optional)
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Spec notes, fitment, voltage — anything a future you wants on hand."
          className="mt-1.5"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/app/inventory")}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={busy || !name.trim() || !sku.trim()}
        >
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <PackagePlus className="h-3.5 w-3.5" />
              Add item
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
