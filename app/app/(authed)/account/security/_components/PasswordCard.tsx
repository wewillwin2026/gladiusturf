"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { setPasswordAction } from "../actions";

export function PasswordCard({ hasExisting }: { hasExisting: boolean }) {
  const [pending, startTransition] = React.useTransition();
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          const result = await setPasswordAction(fd);
          if ("ok" in result) {
            setSavedAt(Date.now());
            toast.success(
              hasExisting ? "Password changed" : "Password set — sign in with email + password next time",
            );
          } else if (result.error === "passwords_dont_match") {
            toast.error("Passwords don't match");
          } else if (result.error === "password_too_short") {
            toast.error("Password must be at least 12 characters");
          } else if (result.error === "current_password_wrong") {
            toast.error("Current password is wrong");
          } else if (result.error === "update_failed") {
            toast.error("Couldn't save — try again or email founders");
          } else {
            toast.error(`Save failed: ${result.error}`);
          }
        })
      }
      className="flex flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-g-accent" />
        <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          {hasExisting ? "Change password" : "Set a password"}
        </span>
      </div>
      <p className="text-[12px] text-g-text-muted leading-relaxed">
        {hasExisting
          ? "Choose a new password. Min 12 characters. We'll require your current password to confirm."
          : "Set a password so you can sign in without an email link. Min 12 characters."}
      </p>

      {hasExisting && (
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] text-g-text-muted">Current password</span>
          <input
            type="password"
            name="current_password"
            autoComplete="current-password"
            required
            className="rounded-md border border-g-border-subtle bg-g-surface px-3 py-2 text-[13px] text-g-text focus:border-g-accent focus:outline-none"
          />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] text-g-text-muted">New password</span>
        <input
          type="password"
          name="new_password"
          autoComplete="new-password"
          minLength={12}
          required
          className="rounded-md border border-g-border-subtle bg-g-surface px-3 py-2 text-[13px] text-g-text focus:border-g-accent focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] text-g-text-muted">Confirm new password</span>
        <input
          type="password"
          name="confirm_password"
          autoComplete="new-password"
          minLength={12}
          required
          className="rounded-md border border-g-border-subtle bg-g-surface px-3 py-2 text-[13px] text-g-text focus:border-g-accent focus:outline-none"
        />
      </label>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-g-accent px-4 py-2 text-[12px] font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving…" : hasExisting ? "Change password" : "Set password"}
        </button>
        {savedAt !== null && (
          <span className="text-[11px] text-g-accent">Saved.</span>
        )}
      </div>
    </form>
  );
}
