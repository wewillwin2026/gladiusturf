"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

type Result = { ok: true; id: string } | { error: string };

/**
 * Classify a measured voltage reading vs nominal 12V LED system. The
 * Florida low-voltage outdoor lighting baseline:
 *   < 9.8  → open   (broken connection / bulb dead)
 *   9.8–10.7 → low  (under-driven, fixture is dim, bulb life is fine)
 *   10.8–13.2 → pass (target window)
 *   13.3–15.5 → high (over-driven; bulb life shortens fast)
 *   > 15.5  → short (wiring fault, safety risk)
 */
function deriveResult(volts: number): "pass" | "low" | "high" | "open" | "short" {
  if (!Number.isFinite(volts)) return "open";
  if (volts < 9.8) return "open";
  if (volts < 10.8) return "low";
  if (volts <= 13.2) return "pass";
  if (volts <= 15.5) return "high";
  return "short";
}

export async function logVoltageTest(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };
  if (session.tenant.vertical !== "lighting") {
    return { error: "wrong_vertical" };
  }

  const customerId = String(formData.get("customerId") ?? "").trim();
  const fixtureId = String(formData.get("fixtureId") ?? "").trim() || null;
  const transformerId =
    String(formData.get("transformerId") ?? "").trim() || null;
  const measuredVoltsRaw = String(formData.get("measuredVolts") ?? "").trim();
  const sourceTapVoltsRaw = String(
    formData.get("sourceTapVolts") ?? "",
  ).trim();
  const tapLabel = String(formData.get("tapLabel") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!customerId) return { error: "missing_customer" };
  const measuredVolts = Number(measuredVoltsRaw);
  if (!Number.isFinite(measuredVolts) || measuredVolts < 0 || measuredVolts > 40) {
    return { error: "invalid_volts" };
  }
  const sourceTapVolts = sourceTapVoltsRaw ? Number(sourceTapVoltsRaw) : null;
  if (
    sourceTapVolts != null &&
    (!Number.isFinite(sourceTapVolts) ||
      sourceTapVolts < 0 ||
      sourceTapVolts > 40)
  ) {
    return { error: "invalid_source_volts" };
  }

  const result = deriveResult(measuredVolts);

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("lighting_voltage_tests")
    .insert({
      tenant_id: session.tenant.id,
      customer_id: customerId,
      fixture_id: fixtureId,
      transformer_id: transformerId,
      measured_volts: measuredVolts,
      source_tap_volts: sourceTapVolts,
      tap_label: tapLabel,
      result,
      notes,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.warn("logVoltageTest insert failed", error);
    return { error: "insert_failed" };
  }

  await sb.from("audit_log").insert({
    tenant_id: session.tenant.id,
    user_id: null,
    action: "voltage_test_logged",
    entity_type: "lighting_voltage_tests",
    entity_id: (data as { id: string }).id,
    metadata: {
      customer_id: customerId,
      fixture_id: fixtureId,
      result,
      volts: measuredVolts,
    },
  });

  revalidatePath(`/app/customers/${customerId}`);
  return { ok: true, id: (data as { id: string }).id };
}
