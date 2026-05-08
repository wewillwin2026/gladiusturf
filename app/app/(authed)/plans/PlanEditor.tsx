"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/app/ui/Dialog";
import { Button } from "@/components/app/ui/Button";
import { Input, Textarea } from "@/components/app/ui/Input";
import { createPlan, updatePlan } from "./actions";

/**
 * Single client component for both edit (existing tier) and create
 * (new custom tier) flows. The page renders a small <PlanEditor>
 * trigger next to each tier card and one "Add custom tier" trigger at
 * the bottom of the list — same modal, different mode + initial
 * values.
 */

export type EditablePlan = {
  id: string;
  tier: "basics" | "care" | "guardian" | "custom";
  display_name: string;
  annual_price_cents: number;
  visits_per_year: number | null;
  cadence: string | null;
  features: string[];
  badge: string | null;
  most_popular: boolean;
  recommended_for: string | null;
  active: boolean;
};

const TIER_OPTIONS: { value: EditablePlan["tier"]; label: string }[] = [
  { value: "basics", label: "Basics" },
  { value: "care", label: "Care" },
  { value: "guardian", label: "Guardian" },
  { value: "custom", label: "Custom" },
];

function dollarsFromCents(cents: number): string {
  // Plain decimal string, no $/, friendly for the input field.
  return (cents / 100).toFixed(2).replace(/\.00$/, "");
}

function errorCopy(code: string): string {
  switch (code) {
    case "display_name_required":
      return "Tier name is required.";
    case "annual_price_cents_invalid":
      return "Price must be greater than $0.";
    case "invalid_tier":
      return "Pick a valid tier slot.";
    case "not_found_in_tenant":
      return "This tier no longer exists in your workspace.";
    case "unauthenticated":
      return "Session expired — please sign in again.";
    default:
      return "Could not save the tier. Try again.";
  }
}

function PlanForm({
  mode,
  initial,
  onClose,
}: {
  mode: "edit" | "create";
  initial: Partial<EditablePlan> | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const startingTier: EditablePlan["tier"] =
    initial?.tier ?? (mode === "create" ? "custom" : "basics");
  const tierLocked =
    mode === "edit" && startingTier !== "custom"; // basics/care/guardian rows can't change slot

  const [displayName, setDisplayName] = React.useState(
    initial?.display_name ?? "",
  );
  const [priceDollars, setPriceDollars] = React.useState(
    initial?.annual_price_cents != null
      ? dollarsFromCents(initial.annual_price_cents)
      : "",
  );
  const [tier, setTier] = React.useState<EditablePlan["tier"]>(startingTier);
  const [badge, setBadge] = React.useState(initial?.badge ?? "");
  const [mostPopular, setMostPopular] = React.useState(
    initial?.most_popular ?? false,
  );
  const [active, setActive] = React.useState(initial?.active ?? true);
  const [features, setFeatures] = React.useState(
    (initial?.features ?? []).join("\n"),
  );
  const [cadence, setCadence] = React.useState(initial?.cadence ?? "");
  const [visitsPerYear, setVisitsPerYear] = React.useState(
    initial?.visits_per_year != null ? String(initial.visits_per_year) : "",
  );
  const [recommendedFor, setRecommendedFor] = React.useState(
    initial?.recommended_for ?? "",
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!displayName.trim()) {
      toast.error("Tier name is required.");
      return;
    }
    const priceNum = Number(priceDollars.replace(/[$,\s]/g, ""));
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error("Price must be greater than $0.");
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("display_name", displayName.trim());
      fd.set("annual_price_cents", priceDollars);
      fd.set("tier", tier);
      fd.set("badge", badge);
      if (mostPopular) fd.set("most_popular", "on");
      if (!active) fd.set("active", "off");
      fd.set("features", features);
      fd.set("cadence", cadence);
      fd.set("visits_per_year", visitsPerYear);
      fd.set("recommended_for", recommendedFor);

      let res: Awaited<ReturnType<typeof updatePlan>>;
      if (mode === "edit" && initial?.id) {
        fd.set("id", initial.id);
        res = await updatePlan(fd);
      } else {
        res = await createPlan(fd);
      }

      if ("error" in res) {
        toast.error(errorCopy(res.error));
        return;
      }
      toast.success(
        mode === "edit"
          ? `${displayName.trim()} updated`
          : `${displayName.trim()} created`,
      );
      onClose();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          Tier name *
        </label>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Bright Care"
          autoFocus
          required
          className="mt-1.5"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Annual price (USD) *
          </label>
          <Input
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value)}
            placeholder="349"
            inputMode="decimal"
            required
            className="mt-1.5"
          />
          <p className="mt-1 text-[11px] text-g-text-faint">
            Whole dollars or decimal. Saved as cents.
          </p>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Tier slot
          </label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as EditablePlan["tier"])}
            disabled={tierLocked}
            className="mt-1.5 h-9 w-full rounded-md bg-g-surface border border-g-border px-3 text-[13px] text-g-text disabled:opacity-50"
          >
            {TIER_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {tierLocked && (
            <p className="mt-1 text-[11px] text-g-text-faint">
              Default tier slot is locked.
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          Badge (optional)
        </label>
        <Input
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          placeholder="Bright Care"
          className="mt-1.5"
        />
        <p className="mt-1 text-[11px] text-g-text-faint">
          Short label that appears above the tier name on cards.
        </p>
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          Features (one per line)
        </label>
        <Textarea
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          rows={6}
          placeholder={"Quarterly visits\nLamp replacements included\n24-hour storm response"}
          className="mt-1.5"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Visit cadence
          </label>
          <Input
            value={cadence}
            onChange={(e) => setCadence(e.target.value)}
            placeholder="Quarterly"
            className="mt-1.5"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Visits per year
          </label>
          <Input
            value={visitsPerYear}
            onChange={(e) => setVisitsPerYear(e.target.value)}
            placeholder="4"
            inputMode="numeric"
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          Recommended for (optional)
        </label>
        <Input
          value={recommendedFor}
          onChange={(e) => setRecommendedFor(e.target.value)}
          placeholder="Mid-size landscape lighting installs"
          className="mt-1.5"
        />
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <label className="inline-flex items-center gap-2 text-[13px] text-g-text">
          <input
            type="checkbox"
            checked={mostPopular}
            onChange={(e) => setMostPopular(e.target.checked)}
            className="h-4 w-4 rounded border-g-border bg-g-surface text-g-accent"
          />
          Mark as most popular (clears the badge on every other tier)
        </label>
        <label className="inline-flex items-center gap-2 text-[13px] text-g-text">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-g-border bg-g-surface text-g-accent"
          />
          Active (uncheck to archive — hides from public pricing)
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={busy || !displayName.trim()}
        >
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              {mode === "edit" ? "Save changes" : "Create tier"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export function EditPlanButton({ plan }: { plan: EditablePlan }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label={`Edit ${plan.display_name}`}
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader
            title={`Edit ${plan.display_name}`}
            description="Rename, reprice, edit the features list, or archive this tier."
          />
          {open && (
            <PlanForm
              mode="edit"
              initial={plan}
              onClose={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AddCustomTierButton() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        Add custom tier
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader
            title="Add custom tier"
            description="Build a tier outside the default Basics / Care / Guardian set — e.g. a higher-end or starter plan."
          />
          {open && (
            <PlanForm
              mode="create"
              initial={null}
              onClose={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
