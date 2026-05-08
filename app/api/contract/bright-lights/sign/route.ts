import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BRIGHT_LIGHTS_TENANT_ID = "6f7c602a-42c3-4475-84de-410deb5a5679";
const ADMIN_EMAIL = "Admin@gladiuscrm.com";

type Ack = { text: string; accepted: boolean };
type Body = {
  signerName?: string;
  signerTitle?: string;
  signerEmail?: string;
  legalName?: string;
  initials?: string;
  signedDate?: string;
  paymentMethod?: "credit_card" | "ach";
  acknowledgments?: Ack[];
  signatureDataUrl?: string;
};

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return bad("Invalid JSON");
  }

  const {
    signerName,
    signerTitle,
    signerEmail,
    legalName,
    initials,
    signedDate,
    paymentMethod,
    acknowledgments,
    signatureDataUrl,
  } = body;

  if (!signerName || signerName.trim().length < 2) return bad("Printed name required");
  if (!signerTitle || signerTitle.trim().length < 2) return bad("Title required");
  if (!signerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signerEmail))
    return bad("Valid email required");
  if (!legalName) return bad("Legal name missing");
  if (!signedDate) return bad("Signed date missing");
  if (paymentMethod !== "credit_card" && paymentMethod !== "ach")
    return bad("Payment method must be selected");
  if (!Array.isArray(acknowledgments) || acknowledgments.length !== 6)
    return bad("All six acknowledgments required");
  if (!acknowledgments.every((a) => a && a.accepted === true))
    return bad("All six acknowledgments must be checked");
  if (!signatureDataUrl || !signatureDataUrl.startsWith("data:image/png;base64,"))
    return bad("Signature image required");

  const sigBase64 = signatureDataUrl.slice("data:image/png;base64,".length);
  if (sigBase64.length < 200) return bad("Signature is empty — please sign and try again");
  if (sigBase64.length > 500_000) return bad("Signature image too large");

  const ip =
    req.headers.get("x-vercel-forwarded-for") ??
    req.headers.get("x-forwarded-for") ??
    "unknown";
  const userAgent = req.headers.get("user-agent") ?? "unknown";
  const signedAt = new Date().toISOString();

  const paymentLabel = paymentMethod === "credit_card" ? "Credit Card (Stripe link)" : "ACH / Bank Transfer";

  // ---- Audit log ----
  try {
    const sb = supabaseAdmin();
    await sb.from("audit_log").insert({
      tenant_id: BRIGHT_LIGHTS_TENANT_ID,
      user_id: null,
      action: "contract.signed",
      entity_type: "contract",
      entity_id: null,
      metadata: {
        legal_name: legalName,
        signer_name: signerName,
        signer_title: signerTitle,
        signer_email: signerEmail,
        initials: initials ?? "CE",
        signed_date_human: signedDate,
        signed_at: signedAt,
        payment_method: paymentMethod,
        acknowledgments,
        ip,
        user_agent: userAgent,
        signature_b64_size: sigBase64.length,
      },
    });
  } catch (err) {
    console.error("contract.signed audit_log insert failed:", err);
    // Continue — email delivery is the legally essential half.
  }

  // ---- Email ----
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Gladius CRM <founders@gladiusturf.com>";

  const subject = `[Signed Contract] ${legalName} — ${signedDate}`;
  const ackHtml = acknowledgments
    .map((a) => `<li style="margin:6px 0;">✅ ${escapeHtml(a.text)}</li>`)
    .join("");

  const html = `
<!doctype html>
<html><body style="font-family:system-ui,sans-serif;line-height:1.55;color:#0C0C0C;max-width:640px;margin:0 auto;padding:24px;">
<h1 style="font-family:Georgia,serif;color:#0E1628;font-size:26px;margin:0 0 8px;">Service Agreement Signed</h1>
<p style="color:#6B6B6B;font-size:13px;margin:0 0 24px;">GLADIUS × BRIGHT LIGHTS · Signed via touchscreen at gladiusturf.com/contract/bright-lights</p>

<table style="width:100%;border-collapse:collapse;font-size:14px;">
  <tr><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;width:42%;color:#6B6B6B;">Client (legal)</td><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;"><strong>${escapeHtml(legalName)}</strong></td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;color:#6B6B6B;">Signer</td><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;">${escapeHtml(signerName)}</td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;color:#6B6B6B;">Title</td><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;">${escapeHtml(signerTitle)}</td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;color:#6B6B6B;">Email</td><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;">${escapeHtml(signerEmail)}</td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;color:#6B6B6B;">Initials applied</td><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;">${escapeHtml(initials ?? "CE")}</td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;color:#6B6B6B;">Date signed</td><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;">${escapeHtml(signedDate)}</td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;color:#6B6B6B;">Timestamp (UTC)</td><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;font-family:monospace;font-size:12px;">${signedAt}</td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;color:#6B6B6B;">Payment method</td><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;"><strong>${escapeHtml(paymentLabel)}</strong></td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;color:#6B6B6B;">IP / User-agent</td><td style="padding:8px 0;border-bottom:1px solid #E5DFD2;font-family:monospace;font-size:11px;color:#6B6B6B;">${escapeHtml(ip)} · ${escapeHtml(userAgent.slice(0, 80))}</td></tr>
</table>

<h2 style="font-family:Georgia,serif;color:#0E1628;font-size:18px;margin:32px 0 8px;">Acknowledgments accepted</h2>
<ul style="padding-left:18px;font-size:14px;">${ackHtml}</ul>

<h2 style="font-family:Georgia,serif;color:#0E1628;font-size:18px;margin:32px 0 8px;">Signature</h2>
<p style="margin:0 0 12px;font-size:13px;color:#6B6B6B;">Captured via touchscreen / pointer input. Original PNG attached for archival.</p>
<img src="${signatureDataUrl}" alt="Signature of ${escapeHtml(signerName)}" style="max-width:480px;border:1px solid #E5DFD2;border-radius:8px;background:#fff;padding:8px;" />

<div style="margin-top:32px;padding:16px;background:#FAFAF7;border:1px solid #E5DFD2;border-radius:8px;font-size:13px;line-height:1.55;color:#3A3A3A;">
<strong>Section 12.8 — Counterparts; Electronic Signatures.</strong> Electronic signatures (including signed-and-scanned PDFs) have the same legal effect as original ink signatures. The countersigned PDF (Ricardo Gamon, Gladius CRM LLC, May 4, 2026) plus this signed receipt together constitute the executed Agreement.
</div>

<p style="margin-top:32px;font-size:12px;color:#6B6B6B;">Gladius CRM LLC · 635 Florenz Circle, Saint Petersburg, FL 33703 · Admin@gladiuscrm.com</p>
</body></html>
`.trim();

  if (!apiKey) {
    // Dry-run: no Resend key configured. Still return success so the UX
    // doesn't break, but tell the operator.
    console.warn(
      "[contract.signed] RESEND_API_KEY not set — signed contract for",
      signerName,
      "captured to audit_log only.",
    );
    return NextResponse.json({
      ok: true,
      mode: "dry_run",
      message: "Signed contract recorded (email dry-run — RESEND_API_KEY not set).",
    });
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: [ADMIN_EMAIL],
      cc: [signerEmail],
      subject,
      html,
      attachments: [
        {
          filename: "signature.png",
          content: sigBase64,
        },
      ],
    });
    if (result.error) {
      console.error("[contract.signed] Resend error:", result.error);
      return NextResponse.json(
        { error: `Email send failed: ${result.error.message}` },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, mode: "sent", emailId: result.data?.id ?? null });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    console.error("[contract.signed] exception:", detail);
    return NextResponse.json({ error: `Email exception: ${detail}` }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
