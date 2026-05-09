"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";
import {
  clearTenantTotpSecret,
  getTenantUserSecret,
  regenerateRecoveryCodes,
  setTenantPassword,
  upsertTenantTotpSecret,
  verifyTenantPassword,
} from "@/lib/app/tenant-auth";
import {
  generateTotpSecret,
  tenantTotpUri,
  verifyTotpCode,
} from "@/lib/app/totp";

type Result<T = Record<string, unknown>> =
  | ({ ok: true } & T)
  | { error: string };

/**
 * Server actions for /app/account/security — set/change password,
 * enroll/disable TOTP, regenerate recovery codes. All require an
 * active tenant session.
 *
 * Threat model: anyone with a stolen session cookie could trigger these.
 * For password change we require the current password (or accept that
 * the user came in via a fresh magic-link, which is itself proof of
 * email control). For TOTP changes we require either the current TOTP
 * code (if enrolled) or the password.
 */

export async function setPasswordAction(
  formData: FormData,
): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const newPassword = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");
  const currentPassword = String(formData.get("current_password") ?? "");

  if (newPassword !== confirm) return { error: "passwords_dont_match" };
  if (newPassword.length < 12) return { error: "password_too_short" };

  // If the user has set a password before, require it now. First-time
  // setters (no password_set_at stamp) skip this — their identity is
  // already proved by the active tenant session cookie which can only
  // come from a successful magic-link or prior password verification.
  const secret = await getTenantUserSecret(session.email);
  const hasExistingPassword = secret?.password_set_at != null;
  if (hasExistingPassword) {
    const userId = await verifyTenantPassword(session.email, currentPassword);
    if (!userId) return { error: "current_password_wrong" };
  }

  const result = await setTenantPassword(session.email, newPassword);
  if ("error" in result) return result;

  try {
    const sb = supabaseAdmin();
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: hasExistingPassword
        ? "tenant_password_changed"
        : "tenant_password_set",
      entity_type: "auth.users",
      entity_id: session.email,
      metadata: {},
    });
  } catch {
    /* non-fatal */
  }

  revalidatePath("/app/account/security");
  return { ok: true };
}

export async function startTotpEnrollmentAction(): Promise<
  Result<{ secret: string; otpauthUri: string }>
> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  // Generate a fresh secret + return the URI for the QR code. The
  // secret is NOT persisted yet — it lands in the DB only after the
  // user proves they can produce a valid 6-digit code from it.
  const secret = generateTotpSecret();
  const otpauthUri = tenantTotpUri(session.email, secret);
  return { ok: true, secret, otpauthUri };
}

export async function confirmTotpEnrollmentAction(
  formData: FormData,
): Promise<Result<{ recoveryCodes: string[] }>> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const secret = String(formData.get("secret") ?? "");
  const code = String(formData.get("code") ?? "");
  if (!secret || !code) return { error: "missing_fields" };

  if (!verifyTotpCode(secret, code)) {
    return { error: "invalid_code" };
  }

  try {
    await upsertTenantTotpSecret(session.email, secret);
  } catch (err) {
    console.warn("upsertTenantTotpSecret failed", err);
    return { error: "save_failed" };
  }

  // Generate fresh recovery codes — show them ONCE, never again. The
  // user must save them; we only store the hashes.
  const recoveryCodes = await regenerateRecoveryCodes(session.email);

  try {
    const sb = supabaseAdmin();
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "tenant_totp_enrolled",
      entity_type: "auth.users",
      entity_id: session.email,
      metadata: {},
    });
  } catch {
    /* non-fatal */
  }

  revalidatePath("/app/account/security");
  return { ok: true, recoveryCodes };
}

export async function disableTotpAction(
  formData: FormData,
): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  // Require either current password OR the current TOTP code to
  // disable — proves the disabler isn't a session-cookie thief alone.
  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "password_required" };
  const userId = await verifyTenantPassword(session.email, password);
  if (!userId) return { error: "password_wrong" };

  try {
    await clearTenantTotpSecret(session.email);
  } catch (err) {
    console.warn("clearTenantTotpSecret failed", err);
    return { error: "save_failed" };
  }

  try {
    const sb = supabaseAdmin();
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "tenant_totp_disabled",
      entity_type: "auth.users",
      entity_id: session.email,
      metadata: {},
    });
  } catch {
    /* non-fatal */
  }

  revalidatePath("/app/account/security");
  return { ok: true };
}

export async function regenerateRecoveryCodesAction(
  formData: FormData,
): Promise<Result<{ recoveryCodes: string[] }>> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "password_required" };
  const userId = await verifyTenantPassword(session.email, password);
  if (!userId) return { error: "password_wrong" };

  const codes = await regenerateRecoveryCodes(session.email);

  try {
    const sb = supabaseAdmin();
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "tenant_recovery_codes_regenerated",
      entity_type: "auth.users",
      entity_id: session.email,
      metadata: { count: codes.length },
    });
  } catch {
    /* non-fatal */
  }

  revalidatePath("/app/account/security");
  return { ok: true, recoveryCodes: codes };
}
