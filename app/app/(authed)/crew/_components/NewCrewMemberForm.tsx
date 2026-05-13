"use client";

import * as React from "react";
import { CircleCheck, Loader2, Plus } from "lucide-react";
import { createCrewMember } from "../actions";

export function NewCrewMemberForm() {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <div className="g-card overflow-hidden">
      <header className="flex items-center justify-between border-b border-g-border-subtle px-5 py-3">
        <h2 className="text-[13px] text-g-text">Add a crew member</h2>
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
              const res = await createCrewMember(fd);
              if ("error" in res) {
                setError(res.error);
              } else {
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
              placeholder="Diego Ramirez"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Role
            </span>
            <select
              name="role"
              defaultValue="crew"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            >
              <option value="owner">Owner</option>
              <option value="chief">Crew chief</option>
              <option value="crew">Crew member</option>
              <option value="admin">Admin</option>
              <option value="apprentice">Apprentice</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Title (optional)
            </span>
            <input
              type="text"
              name="title"
              placeholder="Lead Tech"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Email
            </span>
            <input
              type="email"
              name="email"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Phone
            </span>
            <input
              type="tel"
              name="phone"
              className="rounded-md border border-g-border bg-g-surface-2 px-3 py-2 text-[13px] text-g-text outline-none focus:border-g-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-g-text-faint">
              Hourly rate (USD)
            </span>
            <input
              type="number"
              step="0.5"
              min="0"
              max="500"
              name="hourlyRate"
              placeholder="28"
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
              {pending ? "Adding..." : "Add to crew"}
            </button>
            {ok && (
              <span className="inline-flex items-center gap-1 text-[12px] text-g-success">
                <CircleCheck className="h-3.5 w-3.5" />
                Added. The page will refresh shortly.
              </span>
            )}
            {error && (
              <span className="text-[12px] text-g-danger">
                {error === "missing_name"
                  ? "Display name is required."
                  : `Couldn't add (${error}).`}
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
