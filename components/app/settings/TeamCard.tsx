"use client";

import { useState, useTransition } from "react";
import { Users, Mail, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/app/ui/Button";
import { Input } from "@/components/app/ui/Input";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import {
  inviteTeamMember,
  revokeTeamMember,
  resendInviteEmail,
} from "@/app/app/(authed)/settings/_actions/teamActions";

type Invitation = {
  email: string;
  role: string;
  invited_by: string | null;
  created_at: string;
};

type Props = {
  tenantId: string;
  currentEmail: string;
  currentRole: string;
  invitations: Invitation[];
  memberCount: number;
};

const ALL_ROLES = ["owner", "admin", "operator", "viewer"] as const;

function roleTone(role: string): Tone {
  switch (role) {
    case "owner": return "accent";
    case "admin": return "info";
    case "operator": return "success";
    default: return "neutral";
  }
}

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86_400_000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TeamCard({
  currentEmail,
  currentRole,
  invitations,
  memberCount,
}: Props) {
  const isManager = currentRole === "owner" || currentRole === "admin";

  const availableRoles =
    currentRole === "owner"
      ? ALL_ROLES
      : (["operator", "viewer"] as const);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(availableRoles[availableRoles.length - 1]);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const [rowState, setRowState] = useState<
    Record<string, { loading: boolean; error: string | null; sent?: boolean }>
  >({});

  function setRow(
    rowEmail: string,
    patch: { loading?: boolean; error?: string | null; sent?: boolean },
  ) {
    setRowState((prev) => ({
      ...prev,
      [rowEmail]: { ...prev[rowEmail], ...patch },
    }));
  }

  function handleInvite(formData: FormData) {
    setInviteError(null);
    setInviteSuccess(false);
    startTransition(async () => {
      const res = await inviteTeamMember(formData);
      if ("error" in res) {
        setInviteError(res.error);
      } else {
        setEmail("");
        setInviteSuccess(true);
        setTimeout(() => setInviteSuccess(false), 4000);
      }
    });
  }

  function handleRevoke(memberEmail: string) {
    setRow(memberEmail, { loading: true, error: null });
    const fd = new FormData();
    fd.set("email", memberEmail);
    startTransition(async () => {
      const res = await revokeTeamMember(fd);
      if ("error" in res) {
        setRow(memberEmail, { loading: false, error: res.error });
      } else {
        setRow(memberEmail, { loading: false });
      }
    });
  }

  function handleResend(memberEmail: string) {
    setRow(memberEmail, { loading: true, error: null, sent: false });
    const fd = new FormData();
    fd.set("email", memberEmail);
    startTransition(async () => {
      const res = await resendInviteEmail(fd);
      if ("error" in res) {
        setRow(memberEmail, { loading: false, error: res.error });
      } else {
        setRow(memberEmail, { loading: false, sent: true });
        setTimeout(
          () => setRow(memberEmail, { sent: false }),
          3000,
        );
      }
    });
  }

  return (
    <section className="g-card overflow-hidden" aria-label="Team">
      <header className="flex items-center justify-between px-5 py-4 border-b border-g-border-subtle">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-g-accent" />
          <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Team
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-geist-mono text-g-text-faint">
            {invitations.length} member{invitations.length === 1 ? "" : "s"}
          </span>
          {memberCount > 0 && (
            <StatusPill tone="success">{memberCount} signed in</StatusPill>
          )}
        </div>
      </header>

      {isManager && (
        <div className="border-b border-g-border-subtle px-5 py-4">
          <p className="mb-3 text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Invite team member
          </p>
          <form
            action={handleInvite}
            className="flex flex-col gap-2 sm:flex-row sm:items-start"
          >
            <Input
              type="email"
              name="email"
              required
              placeholder="teammate@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
              className="sm:w-64"
            />
            <select
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={pending}
              className="h-9 rounded-md border border-g-border bg-g-surface px-2 text-[13px] text-g-text focus-visible:border-g-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-g-accent/30 disabled:opacity-50"
            >
              {availableRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={pending}
            >
              {pending ? "Sending…" : "Invite & send link"}
            </Button>
          </form>
          {inviteError && (
            <p className="mt-2 text-[12px] text-g-danger" role="alert">
              {inviteError}
            </p>
          )}
          {inviteSuccess && (
            <p className="mt-2 text-[12px] text-g-accent" role="status">
              Invitation sent — they'll receive an email with a sign-in link.
            </p>
          )}
        </div>
      )}

      <div className="p-4">
        {invitations.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-g-text-muted">
            No team members yet.{isManager ? " Use the form above to invite your first teammate." : ""}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-g-border-subtle/40">
            {invitations.map((inv) => {
              const state = rowState[inv.email] ?? { loading: false, error: null };
              const isSelf = inv.email === currentEmail.toLowerCase();
              return (
                <li
                  key={inv.email}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="text-[13px] font-medium text-g-text truncate">
                      {inv.email}
                    </span>
                    <StatusPill tone={roleTone(inv.role)}>{inv.role}</StatusPill>
                    {isSelf && (
                      <StatusPill tone="neutral">you</StatusPill>
                    )}
                    <span className="text-[11px] font-geist-mono text-g-text-faint">
                      {relTime(inv.created_at)}
                    </span>
                  </div>
                  {isManager && !isSelf && (
                    <div className="flex items-center gap-1">
                      {state.sent ? (
                        <span className="text-[11px] text-g-accent">Sent!</span>
                      ) : (
                        <button
                          type="button"
                          title="Resend sign-in link"
                          disabled={state.loading}
                          onClick={() => handleResend(inv.email)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-g-text-muted hover:bg-g-surface-2 hover:text-g-text disabled:opacity-40"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Resend link
                        </button>
                      )}
                      <button
                        type="button"
                        title="Remove access"
                        disabled={state.loading}
                        onClick={() => handleRevoke(inv.email)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-g-danger/70 hover:bg-g-danger/10 hover:text-g-danger disabled:opacity-40"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                      {state.error && (
                        <span className="text-[11px] text-g-danger">{state.error}</span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {!isManager && (
        <div className="border-t border-g-border-subtle px-5 py-3">
          <div className="flex items-center gap-2 text-[12px] text-g-text-muted">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span>
              To invite teammates, contact your workspace owner or{" "}
              <a
                href="mailto:founders@gladiusturf.com"
                className="text-g-accent hover:underline"
              >
                founders@gladiusturf.com
              </a>
              .
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
