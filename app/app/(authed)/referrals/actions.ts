"use server";

import { revalidatePath } from "next/cache";
import { readAppSession } from "@/lib/app/session";
import { supabaseAdmin } from "@/lib/supabase";

type Result = { ok: true; id: string } | { error: string };

const STATUSES = [
  "pending",
  "contacted",
  "quoted",
  "won",
  "lost",
  "reward_paid",
] as const;
const REWARDS = ["credit", "cash", "gift_card", "free_visit", "other"] as const;

export async function createReferral(formData: FormData): Promise<Result> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const referrerCustomerId = String(
    formData.get("referrerCustomerId") ?? "",
  ).trim();
  const referredName = String(formData.get("referredName") ?? "").trim() || null;
  const referredPhone =
    String(formData.get("referredPhone") ?? "").trim() || null;
  const referredEmail =
    String(formData.get("referredEmail") ?? "").trim().toLowerCase() || null;
  const rewardCentsRaw = String(formData.get("rewardCents") ?? "").trim();
  const rewardCents = rewardCentsRaw ? Math.round(Number(rewardCentsRaw) * 100) : null;
  const rewardKindRaw = String(formData.get("rewardKind") ?? "").trim();
  const rewardKind = (REWARDS as readonly string[]).includes(rewardKindRaw)
    ? rewardKindRaw
    : null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!referrerCustomerId) return { error: "missing_referrer" };
  if (!referredName && !referredPhone && !referredEmail) {
    return { error: "missing_referred_contact" };
  }
  if (rewardCents != null && !Number.isFinite(rewardCents)) {
    return { error: "invalid_reward" };
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("customer_referrals")
    .insert({
      tenant_id: session.tenant.id,
      referrer_customer_id: referrerCustomerId,
      referred_name: referredName,
      referred_phone: referredPhone,
      referred_email: referredEmail,
      reward_cents: rewardCents,
      reward_kind: rewardKind,
      notes,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.warn("createReferral failed", error);
    return { error: "insert_failed" };
  }
  revalidatePath("/app/referrals");
  return { ok: true, id: (data as { id: string }).id };
}

export async function advanceReferral(
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  const session = await readAppSession();
  if (session.kind !== "tenant") return { error: "unauthenticated" };

  const id = String(formData.get("id") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "").trim();
  const status = (STATUSES as readonly string[]).includes(statusRaw)
    ? statusRaw
    : null;
  if (!id || !status) return { error: "invalid_input" };

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("customer_referrals")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("tenant_id", session.tenant.id)
    .eq("id", id);
  if (error) return { error: "update_failed" };
  revalidatePath("/app/referrals");
  return { ok: true };
}
