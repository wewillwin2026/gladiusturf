"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CircleCheck, Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/app/ui/Dialog";
import { Button } from "@/components/app/ui/Button";
import { createInventoryItem } from "../actions";

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
}

export function NewItemDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (!open) {
      setError(null);
      setOk(false);
    }
  }, [open]);

  function submit(formData: FormData) {
    setError(null);
    setOk(false);
    startTransition(async () => {
      const res = await createInventoryItem(formData);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setOk(true);
      formRef.current?.reset();
      // Auto-close + refresh so the new SKU shows up in the table and
      // the Receive dialog's picker.
      setTimeout(() => {
        onOpenChange(false);
        router.refresh();
      }, 600);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader title="New inventory item" />
        <form
          ref={formRef}
          action={submit}
          className="grid gap-3 md:grid-cols-2"
        >
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              SKU
            </span>
            <input
              type="text"
              name="sku"
              required
              placeholder="VOLT-G4-3W"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Display name
            </span>
            <input
              type="text"
              name="name"
              required
              placeholder="VOLT G4 LED · warm white · 3W"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Category
            </span>
            <select
              name="category"
              defaultValue="fixture"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            >
              <option value="fixture">Fixture</option>
              <option value="transformer">Transformer</option>
              <option value="wire">Wire</option>
              <option value="controller">Controller</option>
              <option value="sensor">Sensor</option>
              <option value="bulb">Bulb</option>
              <option value="accessory">Accessory</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Brand
            </span>
            <input
              type="text"
              name="brand"
              placeholder="VOLT, Cast, Unique, etc."
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Unit
            </span>
            <select
              name="unit"
              defaultValue="ea"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            >
              <option value="ea">each</option>
              <option value="ft">feet</option>
              <option value="box">box</option>
              <option value="roll">roll</option>
              <option value="pkg">package</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Unit cost (USD)
            </span>
            <input
              type="number"
              name="unitCost"
              step="0.01"
              min="0"
              max="100000"
              placeholder="48.00"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Par level (optional)
            </span>
            <input
              type="number"
              name="parLevel"
              step="1"
              min="0"
              placeholder="12"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <div className="flex items-center gap-3 md:col-span-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {pending ? "Creating..." : "Create item"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            {ok && (
              <span className="inline-flex items-center gap-1 text-[12px] text-g-success">
                <CircleCheck className="h-3.5 w-3.5" />
                Created. Refreshing…
              </span>
            )}
            {error && (
              <span className="inline-flex items-center gap-1 text-[12px] text-g-danger">
                <CircleAlert className="h-3.5 w-3.5" />
                {error === "missing_sku"
                  ? "SKU is required."
                  : error === "missing_name"
                    ? "Name is required."
                    : error === "duplicate_sku"
                      ? "That SKU already exists."
                      : `Couldn't create (${error}).`}
              </span>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
