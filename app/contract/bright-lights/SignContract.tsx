"use client";

import * as React from "react";

const CLIENT = {
  legalName: "BRIGHT LIGHTS LANDSCAPE LIGHTING LLC",
  signerName: "Cristian M. Encina Vergara",
  signerTitle: "Owner / Registered Agent",
  signerEmail: "cristian.brightlights@gmail.com",
  initials: "CE",
  pdfHref: "/contracts/bright-lights-proposal-agreement.pdf",
};

const ACK_ITEMS = [
  "I understand this is a 90-day Pilot Period that automatically transitions to a 12-month Annual Term on Day 91 unless terminated.",
  "I understand pilot pricing of $399/month to Gladius is for the 90-day Pilot Period only, and post-pilot pricing will be set in a written Pricing Addendum signed before Day 91.",
  "I understand the $300/month ad spend budget is paid by me directly to Meta (not to Gladius), and Gladius does not collect or hold ad spend.",
  "I represent that my company maintains the insurance coverage required of it under Section 13 and will notify the other Party of any lapse.",
  "I acknowledge the Acceptable Use restrictions in Section 16, the Non-Solicitation obligations in Section 18, and the mutual representations in Section 21.",
  "I authorize Gladius to reference Bright Lights Landscape Lighting as a Florida lighting design partner in marketing materials, subject to the approval rights in Section 6.4.",
];

type Status = "idle" | "submitting" | "success" | "error";

export function SignContract() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [hasSignature, setHasSignature] = React.useState(false);
  const [acks, setAcks] = React.useState<boolean[]>(ACK_ITEMS.map(() => false));
  const [paymentMethod, setPaymentMethod] = React.useState<"credit_card" | "ach" | "">("");
  const [printedName, setPrintedName] = React.useState(CLIENT.signerName);
  const [title, setTitle] = React.useState(CLIENT.signerTitle);
  const [email, setEmail] = React.useState(CLIENT.signerEmail);
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [signedPdfBase64, setSignedPdfBase64] = React.useState<string | null>(null);
  const [emailMode, setEmailMode] = React.useState<"sent" | "failed" | "dry_run" | null>(null);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ---- Signature canvas ----
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0E1628";
    ctx.lineWidth = 2.5;
  }, []);

  const drawingRef = React.useRef(false);
  const lastRef = React.useRef<{ x: number; y: number } | null>(null);

  function pointerPos(e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastRef.current = pointerPos(e);
  }

  function draw(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const last = lastRef.current;
    if (!ctx || !last) return;
    const p = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
    if (!hasSignature) setHasSignature(true);
  }

  function endDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    drawingRef.current = false;
    lastRef.current = null;
    canvasRef.current?.releasePointerCapture(e.pointerId);
  }

  function clearSig() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }

  function toggleAck(i: number) {
    setAcks((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  const allAcked = acks.every(Boolean);
  const canSubmit =
    status !== "submitting" &&
    hasSignature &&
    allAcked &&
    paymentMethod !== "" &&
    printedName.trim().length > 1 &&
    title.trim().length > 1;

  async function submit() {
    if (!canSubmit || !canvasRef.current) return;
    setStatus("submitting");
    setErrorMsg(null);

    const signatureDataUrl = canvasRef.current.toDataURL("image/png");

    try {
      const res = await fetch("/api/contract/bright-lights/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: printedName.trim(),
          signerTitle: title.trim(),
          signerEmail: email.trim(),
          legalName: CLIENT.legalName,
          initials: CLIENT.initials,
          signedDate: today,
          paymentMethod,
          acknowledgments: ACK_ITEMS.map((t, i) => ({ text: t, accepted: acks[i] })),
          signatureDataUrl,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(j.error ?? `Server returned ${res.status}`);
        setStatus("error");
        return;
      }
      const j = (await res.json().catch(() => ({}))) as {
        signedPdfBase64?: string;
        mode?: "sent" | "failed" | "dry_run";
      };
      if (j.signedPdfBase64) {
        setSignedPdfBase64(j.signedPdfBase64);
        // Auto-trigger download so a copy lands in Downloads immediately.
        downloadPdf(j.signedPdfBase64);
      }
      setEmailMode(j.mode ?? null);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ ...accentBar, background: "#9CD86E" }} />
          <h1 style={h1Style}>Signed.</h1>
          <p style={leadStyle}>
            Thank you, Cristian. Your service agreement with Gladius CRM LLC is signed and recorded
            as of <strong>{today}</strong>. The signed PDF has been downloaded to this device.
          </p>

          {emailMode === "sent" && (
            <p style={{ ...leadStyle, fontSize: 14, color: "#3A3A3A" }}>
              A copy was also emailed to <strong>{email}</strong> and{" "}
              <strong>Admin@gladiuscrm.com</strong>.
            </p>
          )}
          {(emailMode === "failed" || emailMode === "dry_run") && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#FFF8E5",
                border: "1px solid #F4B860",
                borderRadius: 8,
                fontSize: 13,
                lineHeight: 1.5,
                color: "#3A3A3A",
              }}
            >
              <strong>Note:</strong> the email delivery is still being configured. Please save
              the downloaded PDF and email a copy to <strong>Admin@gladiuscrm.com</strong> when
              convenient. The signature is already legally captured and recorded.
            </div>
          )}

          {signedPdfBase64 && (
            <div style={{ marginTop: 24 }}>
              <button
                type="button"
                onClick={() => downloadPdf(signedPdfBase64)}
                style={{ ...submitBtn, background: "#0E1628" }}
              >
                ⬇ Download signed contract (PDF)
              </button>
              <p style={{ ...leadStyle, fontSize: 12, color: "#6B6B6B", marginTop: 8 }}>
                A copy already started downloading. Tap above if your browser blocked the
                automatic download. Save it to your records.
              </p>
            </div>
          )}

          <p style={{ ...leadStyle, color: "#6B6B6B", fontSize: 14, marginTop: 24 }}>
            Onboarding kicks off this week. Ricardo will be in touch within one business day to
            schedule the first onboarding session and request the access keys outlined in Section 3.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <div style={accentBar} />
        <p style={eyebrowStyle}>GLADIUS × BRIGHT LIGHTS · Service Agreement</p>
        <h1 style={h1Style}>Sign the agreement.</h1>
        <p style={leadStyle}>
          Touch-friendly signing for {CLIENT.legalName}. Your initials{" "}
          <strong style={initialsBadge}>{CLIENT.initials}</strong> will be applied to all 15 pages on
          submit. Gladius is already counter-signed (Ricardo Gamon, May 4, 2026).
        </p>

        <a href={CLIENT.pdfHref} target="_blank" rel="noopener noreferrer" style={pdfLink}>
          📄 Read the full agreement (PDF — 15 pages)
        </a>

        <h2 style={h2Style}>At a glance</h2>
        <div style={tableWrap}>
          <Row label="Effective Date" value="May 8, 2026" />
          <Row label="Initial Term" value="Ninety (90) days — the Pilot Period" />
          <Row label="Transition" value="Auto-converts to a 12-month term on Day 91 unless terminated" />
          <Row label="Software & Website" value="Growth Package — $229/mo, discounted to $199/mo for the Pilot" />
          <Row label="Ad Management Fee" value="$200.00 / month during Pilot Period" />
          <Row label="Client Ad Spend" value="$300.00 / month — paid by Client directly to Meta" />
          <Row label="Pilot Total to Gladius" value="$1,197.00 over 90 days ($399/mo × 3)" />
          <Row label="Day-90 Review" value="Pricing reviewed and confirmed before transition into annual term" />
          <Row label="Governing Law" value="State of Florida" />
        </div>

        <h2 style={h2Style}>Acknowledgments</h2>
        <p style={{ ...leadStyle, fontSize: 13, marginBottom: 16 }}>
          Tap each box to confirm you&rsquo;ve read the corresponding section of the full agreement.
        </p>
        {ACK_ITEMS.map((text, i) => (
          <label key={i} style={ackRow}>
            <input
              type="checkbox"
              checked={acks[i]}
              onChange={() => toggleAck(i)}
              style={checkboxStyle}
            />
            <span style={{ flex: 1, fontSize: 14, lineHeight: 1.5 }}>{text}</span>
          </label>
        ))}

        <h2 style={h2Style}>Payment method on file</h2>
        <p style={{ ...leadStyle, fontSize: 13, marginBottom: 16 }}>
          For the monthly $399 Pilot fee. Ad spend ($300/month) is paid separately by you directly
          to Meta.
        </p>
        <div style={radioGroup}>
          <label style={radioRow}>
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "credit_card"}
              onChange={() => setPaymentMethod("credit_card")}
              style={checkboxStyle}
            />
            <span style={{ flex: 1, fontSize: 15 }}>
              <strong>Credit Card</strong> — Gladius will send a secure Stripe link
            </span>
          </label>
          <label style={radioRow}>
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "ach"}
              onChange={() => setPaymentMethod("ach")}
              style={checkboxStyle}
            />
            <span style={{ flex: 1, fontSize: 15 }}>
              <strong>ACH / Bank Transfer</strong> — Gladius will provide instructions
            </span>
          </label>
        </div>

        <h2 style={h2Style}>Signature</h2>
        <p style={{ ...leadStyle, fontSize: 13, marginBottom: 16 }}>
          Sign with your finger, stylus, or mouse. Touch-friendly.
        </p>
        <div style={canvasWrap}>
          <canvas
            ref={canvasRef}
            onPointerDown={startDraw}
            onPointerMove={draw}
            onPointerUp={endDraw}
            onPointerCancel={endDraw}
            style={{
              width: "100%",
              height: 180,
              touchAction: "none",
              cursor: "crosshair",
              display: "block",
            }}
          />
          <div style={canvasFooter}>
            <span style={{ fontSize: 11, color: "#6B6B6B" }}>
              {hasSignature ? "Signature captured" : "Sign here"}
            </span>
            <button type="button" onClick={clearSig} style={clearBtn}>
              Clear
            </button>
          </div>
        </div>

        <div style={fieldGrid}>
          <Field
            label="Printed name"
            value={printedName}
            onChange={setPrintedName}
            autoComplete="name"
          />
          <Field label="Title" value={title} onChange={setTitle} />
          <Field
            label="Email (for signed copy)"
            value={email}
            onChange={setEmail}
            type="email"
            autoComplete="email"
          />
          <div>
            <label style={fieldLabel}>Date signed</label>
            <input value={today} disabled style={{ ...inputStyle, color: "#6B6B6B" }} />
          </div>
        </div>

        <div style={legalBlock}>
          <strong>Counterparts and Electronic Signatures (Section 12.8).</strong> This Agreement may
          be executed in counterparts. Electronic signatures have the same legal effect as original
          ink signatures.
        </div>

        {errorMsg && (
          <div style={errorBox}>
            <strong>Couldn&rsquo;t submit:</strong> {errorMsg}
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          style={{
            ...submitBtn,
            opacity: canSubmit ? 1 : 0.45,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          {status === "submitting" ? "Submitting…" : "Sign and accept"}
        </button>

        <p style={{ ...leadStyle, fontSize: 12, color: "#6B6B6B", marginTop: 24 }}>
          On submit, your signed agreement is recorded and emailed to {email} and to
          Admin@gladiuscrm.com. Gladius CRM LLC · 635 Florenz Circle, Saint Petersburg, FL 33703.
        </p>
      </div>
    </main>
  );
}

function downloadPdf(base64: string) {
  try {
    const bin = atob(base64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bright Lights x Gladius - Signed Agreement.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5_000);
  } catch (err) {
    console.error("download failed:", err);
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={rowStyle}>
      <span style={rowLabel}>{label}</span>
      <span style={rowValue}>{value}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label style={fieldLabel}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        style={inputStyle}
      />
    </div>
  );
}

// ---- Styles ----

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F5F1E8",
  padding: "32px 16px 64px",
  fontFamily:
    '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  color: "#0C0C0C",
};

const cardStyle: React.CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  background: "#FFFFFF",
  borderRadius: 12,
  padding: "32px 24px 40px",
  boxShadow: "0 4px 24px rgba(14, 22, 40, 0.08)",
  position: "relative",
  overflow: "hidden",
};

const accentBar: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 4,
  background: "#F4B860",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#F4B860",
  fontWeight: 600,
  margin: "8px 0 12px",
};

const h1Style: React.CSSProperties = {
  fontFamily: '"Fraunces", Georgia, serif',
  fontSize: 36,
  lineHeight: 1.1,
  margin: "0 0 12px",
  fontWeight: 600,
};

const h2Style: React.CSSProperties = {
  fontFamily: '"Fraunces", Georgia, serif',
  fontSize: 22,
  lineHeight: 1.2,
  margin: "32px 0 12px",
  fontWeight: 600,
};

const leadStyle: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.6,
  color: "#0C0C0C",
  margin: "0 0 8px",
};

const initialsBadge: React.CSSProperties = {
  display: "inline-block",
  background: "#F4B860",
  color: "#0E1628",
  padding: "2px 8px",
  borderRadius: 4,
  fontFamily: '"Fraunces", Georgia, serif',
  letterSpacing: "0.05em",
};

const pdfLink: React.CSSProperties = {
  display: "inline-block",
  marginTop: 16,
  padding: "10px 16px",
  background: "#F5F1E8",
  border: "1px solid #E5DFD2",
  borderRadius: 8,
  color: "#0E1628",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 500,
};

const tableWrap: React.CSSProperties = {
  border: "1px solid #E5DFD2",
  borderRadius: 8,
  overflow: "hidden",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  padding: "10px 14px",
  borderTop: "1px solid #F0EBDD",
  fontSize: 14,
};

const rowLabel: React.CSSProperties = {
  fontWeight: 600,
  flexShrink: 0,
  color: "#0E1628",
};

const rowValue: React.CSSProperties = {
  textAlign: "right",
  color: "#3A3A3A",
};

const ackRow: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: "12px 0",
  borderTop: "1px solid #F0EBDD",
  cursor: "pointer",
};

const checkboxStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  marginTop: 2,
  flexShrink: 0,
  cursor: "pointer",
  accentColor: "#0E1628",
};

const radioGroup: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 0,
  border: "1px solid #E5DFD2",
  borderRadius: 8,
  overflow: "hidden",
};

const radioRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "14px 16px",
  borderTop: "1px solid #F0EBDD",
  cursor: "pointer",
};

const canvasWrap: React.CSSProperties = {
  border: "2px dashed #C4B89A",
  borderRadius: 8,
  background: "#FFFFFF",
  overflow: "hidden",
};

const canvasFooter: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 12px",
  borderTop: "1px solid #F0EBDD",
  background: "#FAFAF7",
};

const clearBtn: React.CSSProperties = {
  fontSize: 12,
  padding: "4px 10px",
  background: "transparent",
  border: "1px solid #C4B89A",
  borderRadius: 4,
  cursor: "pointer",
  color: "#3A3A3A",
};

const fieldGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginTop: 24,
};

const fieldLabel: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#6B6B6B",
  fontWeight: 600,
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 15,
  border: "1px solid #D4CCB8",
  borderRadius: 6,
  background: "#FFFFFF",
  color: "#0C0C0C",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const legalBlock: React.CSSProperties = {
  marginTop: 24,
  padding: 14,
  background: "#FAFAF7",
  border: "1px solid #E5DFD2",
  borderRadius: 8,
  fontSize: 13,
  lineHeight: 1.55,
  color: "#3A3A3A",
};

const errorBox: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  background: "#FCEEEE",
  border: "1px solid #E85F5F",
  borderRadius: 8,
  fontSize: 13,
  color: "#7A1F1F",
};

const submitBtn: React.CSSProperties = {
  marginTop: 24,
  width: "100%",
  padding: "16px 24px",
  background: "#0E1628",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 600,
  fontFamily: "inherit",
  letterSpacing: "0.02em",
};
