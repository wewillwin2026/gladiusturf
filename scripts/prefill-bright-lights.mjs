// One-off: pre-fill the Bright Lights agreement with CE initials and
// white-out the "Felipe Encina, Operator" line so the cover-page
// PREPARED FOR block names only Cristian, then save next to the user's
// Downloads folder so it can be opened, signed on touchscreen, and
// saved back.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { PDFDocument, rgb } from "pdf-lib";

const SOURCE = "public/contracts/bright-lights-proposal-agreement.pdf";
const OUT = join(homedir(), "Downloads", "Bright Lights - Ready for Cristian to Sign.pdf");

const bytes = readFileSync(SOURCE);
const pdf = await PDFDocument.load(bytes);
const form = pdf.getForm();

// 1. Pre-fill CE initials on every page footer.
for (let i = 1; i <= 15; i++) {
  try {
    form.getTextField(`client_initials_p${i}`).setText("CE");
  } catch (err) {
    console.warn(`  initials_p${i}: ${err.message}`);
  }
}

// 2. White-rectangle over "Felipe Encina, Operator" on page 1 +
//    page 11 (Section 15.1 contact block). Coordinates measured
//    against page size 612 x 792.
//
//    Page 1 — PREPARED FOR block on the cover. The line "Felipe
//    Encina, Operator" sits below "Cristian M. Encina Vergara,
//    Owner / Registered Agent" inside a column starting around x=50
//    with each line ~14pt tall.
//
//    Approximate y-coords (bottom-left origin):
//      Page 1 Felipe line: y≈626 (visually above Principal Address).
//      Page 11 Felipe line: y≈710 (just under Cristian's line).
//
//    The whiteouts are sized generously so they cover descenders.

const page1 = pdf.getPages()[0];
page1.drawRectangle({ x: 48, y: 622, width: 270, height: 16, color: rgb(1, 1, 1) });

const page11 = pdf.getPages()[10];
page11.drawRectangle({ x: 48, y: 706, width: 270, height: 16, color: rgb(1, 1, 1) });

// 3. Save. Don't flatten — Cristian still needs the form to be
//    interactive so he can check the ack boxes, pick payment method,
//    sign, type his name/title/date, and save.

const out = await pdf.save();
writeFileSync(OUT, out);
console.log(`✓ Saved: ${OUT}`);
console.log(`  Size: ${(out.length / 1024).toFixed(1)} KB`);
console.log("");
console.log("Next steps:");
console.log("  1. Open the PDF — any reader works (Acrobat, Preview, Edge, Chrome).");
console.log("  2. Cristian signs the client_sig field (touchscreen, finger, or stylus).");
console.log("  3. Cristian fills printed name, title, date.");
console.log("  4. Cristian checks the 6 acknowledgment boxes + 1 payment method.");
console.log("  5. Save / Save As → email back to Admin@gladiuscrm.com.");
