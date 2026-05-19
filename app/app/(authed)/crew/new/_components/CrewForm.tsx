"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/app/ui/Button";
import { Input, Textarea } from "@/components/app/ui/Input";
import { createCrewMember, type CrewRole } from "../actions";

export function CrewForm() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState<CrewRole>("tech");
  const [title, setTitle] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [hourlyRate, setHourlyRate] = React.useState("");
  const [hireDate, setHireDate] = React.useState("");
  const [notes, setNotes] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!name.trim()) {
      toast.error("Crew member name is required.");
      return;
    }
    setBusy(true);
    try {
      const rate = hourlyRate.trim();
      const res = await createCrewMember({
        display_name: name,
        role,
        title: title || null,
        email: email || null,
        phone: phone || null,
        hourly_rate_dollars: rate ? Number(rate) : null,
        hire_date: hireDate || null,
        notes: notes || null,
      });
      if ("error" in res) {
        toast.error(
          res.error === "missing_name"
            ? "Crew member name is required."
            : "Could not save the crew member. Try again or email founders@gladiusturf.com.",
        );
        return;
      }
      toast.success(`Added ${name}`);
      router.push("/app/crew");
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
            Name *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Diego Ramirez"
            autoFocus
            required
            className="mt-1.5"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as CrewRole)}
              className="mt-1.5 h-9 w-full rounded-md bg-g-surface border border-g-border px-3 text-[13px] text-g-text focus-visible:border-g-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-g-accent/30"
            >
              <option value="lead">Lead</option>
              <option value="tech">Tech</option>
              <option value="helper">Helper</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lead Installer"
              className="mt-1.5"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="diego@example.com"
              autoComplete="email"
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Phone
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(941) 555-0124"
              autoComplete="tel"
              className="mt-1.5"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Hourly rate (USD)
            </label>
            <Input
              type="number"
              step="0.5"
              min="0"
              max="500"
              inputMode="decimal"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="28"
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Hire date
            </label>
            <Input
              type="date"
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
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
          placeholder="Anything you want a future you to remember about this crew member."
          className="mt-1.5"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/app/crew")}
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
              <UserPlus className="h-3.5 w-3.5" />
              Add crew member
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
