"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Users, Mail, Trash2, RefreshCw, UserPlus } from "lucide-react";
import { Button } from "@/components/app/ui/Button";
import { StatusPill, type Tone } from "@/components/app/ui/StatusPill";
import {
  revokeTeamMember,
  resendInviteEmail,
} from "@/app/app/(authed)/settings/_actions/teamActions";
import { parseInvitationTitle } from "@/app/app/(authed)/settings/team/new/title";
import { ROLE_LABEL } from "@/lib/app/access";
import type { TenantRole } from "@/lib/app/tenant-auth";

type Invitation = {
  email: string;
  role: string;
  invited_by: string | null;
  created_at: string;
  notes: string | null;
};

type Props = {
  tenantId: string;
  currentEmail: string;
  currentRole: string;
  invitations: Invitation[];
  memberCount: number;
};

function isTenantRole(value: string): value is TenantRole {
  return value === "owner" || value === "admin" || value === "operator" || value === "viewer";
}

/** Friendly preset label for a stored role code; falls back to the raw string. */
function roleLabel(role: string): string {
  return isTenantRole(role) ? ROLE_LABEL[role] : role;
}

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
  // Only the workspace OWNER can add or remove users. (Managers can do
  // operational work; user management is owner-only per the matrix.)
  const isOwner = currentRole === "owner";

  const [, startTransition] = useTransition();
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
      <header className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-g-border-subtle">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-g-accent" />
          <span className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Team
          </span>
          <span className="text-[11px] font-geist-mono text-g-text-faint">
            · {invitations.length} member{invitations.length === 1 ? "" : "s"}
          </span>
          {memberCount > 0 && (
            <StatusPill tone="success">{memberCount} signed in</StatusPill>
          )}
        </div>
        {isOwner && (
          <Link href="/app/settings/team/new" prefetch>
            <Button variant="primary" size="sm">
              <UserPlus className="h-3.5 w-3.5" />
              Add user
            </Button>
          </Link>
        )}
      </header>

      <div className="p-4">
        {invitations.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-g-text-muted">
            No team members yet.{isOwner ? " Click \"Add user\" to add your first teammate." : ""}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-g-border-subtle/40">
            {invitations.map((inv) => {
              const state = rowState[inv.email] ?? { loading: false, error: null };
              const isSelf = inv.email === currentEmail.toLowerCase();
              const title = parseInvitationTitle(inv.notes);
              return (
                <li
                  key={inv.email}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[13px] font-medium text-g-text truncate">
                        {inv.email}
                      </span>
                      {title && (
                        <span className="text-[11px] text-g-text-muted truncate">
                          {title}
                        </span>
                      )}
                    </div>
                    <StatusPill tone={roleTone(inv.role)}>{roleLabel(inv.role)}</StatusPill>
                    {isSelf && (
                      <StatusPill tone="neutral">you</StatusPill>
                    )}
                    <span className="text-[11px] font-geist-mono text-g-text-faint">
                      {relTime(inv.created_at)}
                    </span>
                  </div>
                  {isOwner && !isSelf && (
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
                        title="Remove user"
                        disabled={state.loading}
                        onClick={() => {
                          if (confirm(`Remove ${inv.email} from this workspace? They lose access immediately.`)) {
                            handleRevoke(inv.email);
                          }
                        }}
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

      {!isOwner && (
        <div className="border-t border-g-border-subtle px-5 py-3">
          <div className="flex items-center gap-2 text-[12px] text-g-text-muted">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span>
              Only the workspace owner can add or remove users. Contact them or{" "}
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
