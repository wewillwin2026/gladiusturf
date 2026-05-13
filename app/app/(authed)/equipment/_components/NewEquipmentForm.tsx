"use client";

import * as React from "react";
import { CircleCheck, Loader2, Plus } from "lucide-react";
import { createEquipment } from "../actions";

export function NewEquipmentForm() {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [ok, setOk] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <div className="g-card overflow-hidden">
      <header className="flex items-center justify-between border-b border-g-border-subtle px-5 py-3">
        <h2 className="text-[13px] text-g-text">Add equipment</h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-g-border bg-g-surface-2 px-3 py-1.5 text-[11px] font-medium text-g-text transition-colors hover:bg-g-surface-3"
        >
          {open ? "Cancel" : "Add"}
        </button>
      </header>
      {open && (
        <form
          ref={formRef}
          action={(fd) => {
            setError(null);
            setOk(false);
            startTransition(async () => {
              const res = await createEquipment(fd);
              if ("error" in res) setError(res.error);
              else {
                setOk(true);
                formRef.current?.reset();
              }
            });
          }}
          className="grid gap-3 px-5 py-4 md:grid-cols-3"
        >
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Display name
            </span>
            <input
              type="text"
              name="displayName"
              required
              placeholder="T-104"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Category
            </span>
            <select
              name="category"
              defaultValue="truck"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            >
              <option value="truck">Truck</option>
              <option value="mower">Mower</option>
              <option value="blower">Blower</option>
              <option value="trimmer">Trimmer</option>
              <option value="lift">Lift</option>
              <option value="trailer">Trailer</option>
              <option value="multimeter">Multimeter</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Make
            </span>
            <input
              type="text"
              name="make"
              placeholder="Ford"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Model
            </span>
            <input
              type="text"
              name="model"
              placeholder="F-250"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Serial #
            </span>
            <input
              type="text"
              name="serialNo"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Asset tag
            </span>
            <input
              type="text"
              name="assetTag"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Purchase date
            </span>
            <input
              type="date"
              name="purchaseDate"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Notes
            </span>
            <input
              type="text"
              name="notes"
              placeholder="Front-line truck · Diego's"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <div className="flex items-center gap-3 md:col-span-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-full bg-g-accent px-4 py-2 text-[12px] font-semibold text-g-bg transition-colors hover:bg-g-accent-bright disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {pending ? "Adding..." : "Add to fleet"}
            </button>
            {ok && (
              <span className="inline-flex items-center gap-1 text-[12px] text-g-success">
                <CircleCheck className="h-3.5 w-3.5" />
                Added.
              </span>
            )}
            {error && (
              <span className="text-[12px] text-g-danger">
                {error === "missing_name" ? "Name required." : `Couldn't add (${error}).`}
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
