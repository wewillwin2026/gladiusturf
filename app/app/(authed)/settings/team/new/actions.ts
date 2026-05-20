"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import {
  getTenantBySlug,
  setTenantPassword,
  type TenantRole,
} from "@/lib/app/tenant-auth";

export type AddTeamMemberInput = {
  email: string;
  password: string;
  title: string | null;
  role: TenantRole;
};

export type AddTeamMemberResult =
  | { ok: true; email: string }
  | { error: string };

const ALLOWED_ROLES: ReadonlySet<TenantRole> = new Set<TenantRole>([
  "owner",
  "admin",
  "operator",
  "viewer",
]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Add a user to the workspace in one step: email + password + title +
 * role. Mirrors the customers/new server-action shape.
 *
 * Title is stored as JSON in the existing `tenant_invitations.notes`
 * column ({"title":"..."}) — sidesteps a schema migration so this ships
 * unblocked. Read with parseInvitationTitle() in TeamCard.
 *
 * The password is set via auth.admin (creates the auth.users row if
 * needed, then updates the password) — reusing the proven
 * setTenantPassword() in lib/app/tenant-auth.ts. Felipe shares the
 * password with the new user out-of-band; the welcome email contains a
 * sign-in link but NEVER the plaintext password.
 */
export async function addTeamMember(
  input: AddTeamMemberInput,
): Promise<AddTeamMemberResult> {
  const session = await readAppSession();
  if (session.kind !== "tenant") {
    return { error: "unauthenticated" };
  }

  // Only owners can add users (matches the matrix — Settings/Team is
  // owner-only). The (authed) layout already redirects non-owners away
  // from /app/settings/team/new; this is the defense-in-depth check.
  if (session.role !== "owner") {
    return { error: "Only the workspace owner can add users." };
  }

  const tenant = await getTenantBySlug(session.tenantSlug);
  if (!tenant) return { error: "tenant_not_found" };

  const email = (input.email ?? "").trim().toLowerCase();
  const password = (input.password ?? "").trim();
  const title = (input.title ?? "").trim();
  const role = input.role;

  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 12) {
    return { error: "Password must be at least 12 characters." };
  }
  if (!ALLOWED_ROLES.has(role)) return { error: "Pick a role." };

  // Set the password (creates the auth user if missing, then updates).
  const pwRes = await setTenantPassword(email, password);
  if ("error" in pwRes) {
    return {
      error:
        pwRes.error === "password_too_short"
          ? "Password must be at least 12 characters."
          : pwRes.error === "password_too_long"
            ? "Password is too long."
            : "Could not set the password. Try again or email founders@gladiusturf.com.",
    };
  }

  // Upsert the invitation (role + title-as-JSON-in-notes).
  // NOTE: `invited_by` is a uuid (FK to auth.users) — the old code in
  // `_actions/teamActions.ts:inviteTeamMember` passed `session.email`
  // (a string) which violates the column type. We omit it here (null
  // is the existing convention; every prior row has invited_by=null).
  const sb = supabaseAdmin();
  const notesJson = title ? JSON.stringify({ title }) : null;
  const { error: dbError } = await sb.from("tenant_invitations").upsert(
    {
      tenant_id: tenant.id,
      email,
      role,
      status: "active",
      notes: notesJson,
    },
    { onConflict: "email,tenant_id" },
  );
  if (dbError) return { error: dbError.message };

  revalidatePath("/app/settings");
  return { ok: true, email };
}

// parseInvitationTitle lives in a separate non-server file so it can be
// imported by both client and server components. A "use server" file
// may only export async server actions.
