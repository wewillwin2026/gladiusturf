"use client";

import { useState, useTransition } from "react";
import { addInvitation } from "./actions";
import { Button } from "@/components/app/ui/Button";
import { Input } from "@/components/app/ui/Input";

const ROLES = ["owner", "admin", "operator", "viewer"] as const;

export function InviteForm({ tenantId }: { tenantId: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("operator");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await addInvitation(formData);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setEmail("");
      setRole("operator");
    });
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <input type="hidden" name="tenant_id" value={tenantId} />
      <Input
        type="email"
        name="email"
        required
        placeholder="ops@dealer.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={pending}
        className="sm:w-64"
      />
      <select
        name="role"
        value={role}
        onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
        disabled={pending}
        className="h-9 rounded-md border border-g-border bg-g-surface px-2 text-[13px] text-g-text focus-visible:border-g-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-g-accent/30 disabled:opacity-50"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <Button type="submit" variant="primary" size="md" disabled={pending}>
        {pending ? "Inviting…" : "Invite"}
      </Button>
      {error && (
        <span className="text-[12px] text-g-danger" role="alert">
          {error}
        </span>
      )}
    </form>
  );
}
