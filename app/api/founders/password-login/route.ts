import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  isFounderEmail,
  createFounderSessionCookieValue,
  buildFounderSetCookieHeader,
} from "@/lib/founders/auth";

export const runtime = "nodejs";

function verifyFounderPassword(email: string, password: string): boolean {
  const creds = (process.env.GLADIUS_FOUNDER_CREDENTIALS || "").trim();
  if (!creds) return false;

  for (const pair of creds.split(",")) {
    const colonIdx = pair.indexOf(":");
    if (colonIdx < 0) continue;
    const credEmail = pair.slice(0, colonIdx).toLowerCase().trim();
    const credHash = pair.slice(colonIdx + 1).trim();
    if (credEmail !== email) continue;

    const inputHash = createHash("sha256").update(password).digest("hex");
    if (inputHash.length !== credHash.length) return false;
    try {
      return timingSafeEqual(Buffer.from(inputHash, "hex"), Buffer.from(credHash, "hex"));
    } catch {
      return false;
    }
  }
  return false;
}

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  if (!isFounderEmail(email)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (!verifyFounderPassword(email, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const cookie = createFounderSessionCookieValue(email);
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", buildFounderSetCookieHeader(cookie));
  return res;
}
