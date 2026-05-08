// One-off: pre-fill the Bright Lights agreement with CE initials,
// white-out "Felipe Encina, Operator" so the cover-page PREPARED FOR
// block names only Cristian, change all dates to today (May 8, 2026),
// then save next to the user's Downloads folder so it can be opened,
// signed on touchscreen, and saved back.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const SOURCE = "public/contracts/bright-lights-proposal-agreement.pdf";
const OUT = join(homedir(), "Downloads", "Bright Lights - Ready for Cristian to Sign.pdf");

// Today's date — change here if re-running on a different day.
const TODAY_DATE = "May 8, 2026";

const bytes = readFileSync(SOURCE);
const pdf = await PDFDocument.load(bytes);
const form = pdf.getForm();
const helv = await pdf.embedFont(StandardFonts.Helvetica);
const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);

// 1. Pre-fill CE initials on every page footer.
for (let i = 1; i <= 15; i++) {
  try {
    form.getTextField(`client_initials_p${i}`).setText("CE");
  } catch (err) {
    console.warn(`  initials_p${i}: ${err.message}`);
  }
}

// 2. White-rectangle over "Felipe Encina, Operator" on page 1 +
//    page 11 (Section 15.1 contact block). Coordinates from page size
//    612 x 792, bottom-left origin.
const page1 = pdf.getPages()[0];
page1.drawRectangle({ x: 48, y: 622, width: 270, height: 16, color: rgb(1, 1, 1) });

const page11 = pdf.getPages()[10];
page11.drawRectangle({ x: 48, y: 706, width: 270, height: 16, color: rgb(1, 1, 1) });

// 3. Re-date every reference of "May 4, 2026" / "May 5, 2026" to today.
//    Coordinates discovered via pdfjs-dist text extraction.
//    Each entry: page index, x, y (baseline), width, fontSize, replacement text.
const DATE_PATCHES = [
  // Footer on every page: "Document Date: May 5, 2026"
  ...Array.from({ length: 15 }, (_, i) => ({
    page: i,
    x: 43.2,
    y: 32.4,
    width: 100,
    height: 9,
    fontSize: 7.5,
    replacement: `Document Date: ${TODAY_DATE}`,
  })),
  // Page 1 body: "May 5, 2026" (Document Date)
  { page: 0, x: 133.4, y: 565.2, width: 60, height: 12, fontSize: 10, replacement: TODAY_DATE },
  // Page 1 body: "May 4, 2026" (Effective Date)
  { page: 0, x: 269.1, y: 565.2, width: 60, height: 12, fontSize: 10, replacement: TODAY_DATE },
  // Page 1 AT A GLANCE table: "May 4, 2026" (Effective Date row)
  { page: 0, x: 206.4, y: 248.0, width: 60, height: 12, fontSize: 10, replacement: TODAY_DATE },
  // Page 6 body: "as of May 4, 2026" (Service Agreement opening)
  { page: 5, x: 380.9, y: 547.8, width: 60, height: 11, fontSize: 9, replacement: TODAY_DATE },
  // Page 15 signature block: Gladius "DATE SIGNED" — May 4, 2026
  { page: 14, x: 310.0, y: 582.2, width: 70, height: 13, fontSize: 11, replacement: TODAY_DATE },
];

const pages = pdf.getPages();
for (const patch of DATE_PATCHES) {
  const p = pages[patch.page];
  // Whiteout — pad slightly below baseline so descenders (in case of g/j/y
  // in the replacement) get covered too, and a touch above baseline.
  p.drawRectangle({
    x: patch.x - 1,
    y: patch.y - 2,
    width: patch.width,
    height: patch.height + 3,
    color: rgb(1, 1, 1),
  });
  // Restamp.
  p.drawText(patch.replacement, {
    x: patch.x,
    y: patch.y,
    size: patch.fontSize,
    font: helv,
    color: rgb(0, 0, 0),
  });
}

// 4. Save. Don't flatten — Cristian still needs the form to be
//    interactive so he can check the ack boxes, pick payment method,
//    sign, type his name/title/date, and save.

const out = await pdf.save();
writeFileSync(OUT, out);
console.log(`✓ Saved: ${OUT}`);
console.log(`  Size: ${(out.length / 1024).toFixed(1)} KB`);
console.log(`  All dates replaced with: ${TODAY_DATE}`);
