import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const PDF_PATH = join(
  process.cwd(),
  "public",
  "contracts",
  "bright-lights-proposal-agreement.pdf",
);

export type StampInput = {
  signerName: string;
  signerTitle: string;
  signedDate: string;
  signatureDataUrl: string;
  initials: string;
  paymentMethod: "credit_card" | "ach";
  ackKeys: string[];
};

// Today's contract date — used to overwrite the May 4 / May 5 references
// baked into the source PDF body text. Update if signing on a different
// calendar day.
const CONTRACT_DATE = "May 8, 2026";

const DATE_PATCHES: ReadonlyArray<{
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  replacement: string;
}> = [
  ...Array.from({ length: 15 }, (_, i) => ({
    page: i,
    x: 43.2,
    y: 32.4,
    width: 100,
    height: 9,
    fontSize: 7.5,
    replacement: `Document Date: ${CONTRACT_DATE}`,
  })),
  { page: 0, x: 133.4, y: 565.2, width: 60, height: 12, fontSize: 10, replacement: CONTRACT_DATE },
  { page: 0, x: 269.1, y: 565.2, width: 60, height: 12, fontSize: 10, replacement: CONTRACT_DATE },
  { page: 0, x: 206.4, y: 248.0, width: 60, height: 12, fontSize: 10, replacement: CONTRACT_DATE },
  { page: 5, x: 380.9, y: 547.8, width: 60, height: 11, fontSize: 9, replacement: CONTRACT_DATE },
  { page: 14, x: 310.0, y: 582.2, width: 70, height: 13, fontSize: 11, replacement: CONTRACT_DATE },
];

export async function stampBrightLightsContract(input: StampInput): Promise<Uint8Array> {
  const bytes = readFileSync(PDF_PATH);
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();
  const helv = await pdf.embedFont(StandardFonts.Helvetica);

  // Re-date every May 4 / May 5 reference in the source PDF.
  const allPages = pdf.getPages();
  for (const patch of DATE_PATCHES) {
    const p = allPages[patch.page];
    p.drawRectangle({
      x: patch.x - 1,
      y: patch.y - 2,
      width: patch.width,
      height: patch.height + 3,
      color: rgb(1, 1, 1),
    });
    p.drawText(patch.replacement, {
      x: patch.x,
      y: patch.y,
      size: patch.fontSize,
      font: helv,
      color: rgb(0, 0, 0),
    });
  }

  // Whiteout "Felipe Encina, Operator" on cover (p1) + Section 15.1 (p11).
  allPages[0].drawRectangle({ x: 48, y: 622, width: 270, height: 16, color: rgb(1, 1, 1) });
  allPages[10].drawRectangle({ x: 48, y: 706, width: 270, height: 16, color: rgb(1, 1, 1) });

  // Initials on every page footer.
  for (let i = 1; i <= 15; i++) {
    try {
      form.getTextField(`client_initials_p${i}`).setText(input.initials);
    } catch {
      // Skip missing field — non-fatal.
    }
  }

  // Acknowledgment checkboxes.
  for (const key of input.ackKeys) {
    try {
      form.getCheckBox(key).check();
    } catch {
      // Skip unknown keys.
    }
  }

  // Payment method.
  try {
    if (input.paymentMethod === "credit_card") form.getCheckBox("pay_cc").check();
    else form.getCheckBox("pay_ach").check();
  } catch {
    // No-op.
  }

  // Printed name, title, date as text.
  try {
    form.getTextField("client_name").setText(input.signerName);
  } catch {}
  try {
    form.getTextField("client_title").setText(input.signerTitle);
  } catch {}
  try {
    form.getTextField("client_date").setText(input.signedDate);
  } catch {}

  // Signature image overlay on page 15 (client_sig rectangle).
  // Coordinates measured from the AcroForm widget: x=61.2 y=662.9 w=208.8 h=18.7.
  // We render the signature ~3x taller than the field to mimic an actual signature
  // height; pdf-lib coordinates are bottom-left origin.
  const sigB64 = input.signatureDataUrl.replace(/^data:image\/png;base64,/, "");
  const sigBytes = Buffer.from(sigB64, "base64");
  const sigImage = await pdf.embedPng(sigBytes);

  const page15 = allPages[14];
  const sigBoxX = 61.2;
  const sigBoxY = 662.9;
  const sigBoxW = 208.8;
  const sigBoxH = 18.7;
  // Render signature height up to 50pt while preserving aspect ratio + maxing width at sigBoxW.
  const targetMaxH = 48;
  const ratio = sigImage.width / sigImage.height;
  let drawH = Math.min(targetMaxH, sigBoxW / ratio);
  let drawW = drawH * ratio;
  if (drawW > sigBoxW) {
    drawW = sigBoxW;
    drawH = sigBoxW / ratio;
  }
  // Center horizontally over the signature box; sit the baseline on top of the box.
  const drawX = sigBoxX + (sigBoxW - drawW) / 2;
  const drawY = sigBoxY + sigBoxH * 0.5; // overlap the field a touch
  page15.drawImage(sigImage, { x: drawX, y: drawY, width: drawW, height: drawH });

  // Audit timestamp + "SIGNED ELECTRONICALLY" annotation just below the signature.
  page15.drawText(
    `Signed electronically · ${new Date().toISOString().replace("T", " ").slice(0, 16)} UTC`,
    {
      x: sigBoxX,
      y: sigBoxY - 8,
      size: 7,
      font: helv,
      color: rgb(0.42, 0.42, 0.42),
    },
  );

  // Flatten so post-signing edits aren't possible in a downstream PDF reader.
  form.flatten();

  return await pdf.save();
}

const ACK_ORDER: readonly string[] = [
  "ack_pilot",
  "ack_pricing_review",
  "ack_ad_spend",
  "ack_insurance",
  "ack_acceptable_use",
  "ack_marketing",
];

export function ackKeysFromAccepted(acks: { accepted: boolean }[]): string[] {
  return acks
    .map((a, i) => (a.accepted ? ACK_ORDER[i] : null))
    .filter((k): k is string => k !== null);
}
