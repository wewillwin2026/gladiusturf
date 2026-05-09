"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Tenant dashboard server actions — Day-1 onboarding checklist (2026-05-08).
 *
 * Felipe + Cristian (Bright Lights pilot) need a guided first hour. The
 * /app dashboard renders <OnboardingChecklist /> which surfaces 6 setup
 * steps; two of them (plans_reviewed, review_ask_dismissed) are
 * dismissible flags written here. Each call:
 *   - requires a tenant session (demo/unauthenticated rejected)
 *   - merges the flag into tenants.onboarding_steps (jsonb) for the
 *     CALLER'S tenant only — never a tenant id from the form payload
 *   - audit-logs the step + value for replay
 *
 * Allowed step keys are constrained server-side; an attacker can't write
 * arbitrary keys into the jsonb blob.
 */

const ALLOWED_STEPS = ["plans_reviewed", "review_ask_dismissed"] as const;
type OnboardingStep = (typeof ALLOWED_STEPS)[number];

type Result = { ok: true } | { error: string };

function isAllowedStep(value: string): value is OnboardingStep {
  return (ALLOWED_STEPS as readonly string[]).includes(value);
}

/**
 * Mark a dismissible onboarding step complete. Reads the existing jsonb,
 * merges the flag, writes it back. Tenant-scoped via the session — the
 * form's tenant_id is intentionally ignored.
 */
export async function dismissOnboardingStep(
  formData: FormData,
): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const stepRaw = String(formData.get("step") ?? "").trim();
  if (!isAllowedStep(stepRaw)) return { error: "invalid_step" };

  const sb = supabaseAdmin();

  // Read current onboarding_steps so we can merge rather than overwrite.
  // jsonb_set in a single statement would also work, but a read-then-write
  // keeps the action symmetric with how server actions elsewhere in the
  // codebase handle merge-style writes (see plans/actions.ts).
  const { data: existing, error: readErr } = await sb
    .from("tenants")
    .select("onboarding_steps")
    .eq("id", session.tenant.id)
    .maybeSingle();
  if (readErr || !existing) {
    console.warn("dismissOnboardingStep read error", readErr);
    return { error: "read_failed" };
  }

  const current =
    (existing as { onboarding_steps: Record<string, unknown> | null })
      .onboarding_steps ?? {};
  const next = { ...current, [stepRaw]: true };

  const { error: writeErr } = await sb
    .from("tenants")
    .update({ onboarding_steps: next })
    .eq("id", session.tenant.id);
  if (writeErr) {
    console.warn("dismissOnboardingStep write error", writeErr);
    return { error: "write_failed" };
  }

  try {
    await sb.from("audit_log").insert({
      tenant_id: session.tenant.id,
      user_id: null,
      action: "onboarding_step_dismissed",
      entity_type: "tenant",
      entity_id: session.tenant.id,
      metadata: { step: stepRaw },
    });
  } catch (err) {
    console.warn("audit insert failed (non-fatal)", err);
  }

  revalidatePath("/app");
  return { ok: true };
}
