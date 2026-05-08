import { readFileSync } from "node:fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const bytes = readFileSync("public/contracts/bright-lights-proposal-agreement.pdf");
const doc = await getDocument({ data: new Uint8Array(bytes) }).promise;

const PATTERNS = [/May 4, 2026/i, /May 5, 2026/i];

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const tc = await page.getTextContent();
  for (const item of tc.items) {
    if (!item.str) continue;
    for (const re of PATTERNS) {
      if (re.test(item.str)) {
        const x = item.transform[4];
        const y = item.transform[5];
        const w = item.width;
        const h = item.height;
        console.log(`p${p} "${item.str}" x=${x.toFixed(1)} y=${y.toFixed(1)} w=${w.toFixed(1)} h=${h.toFixed(1)}`);
      }
    }
  }
}
