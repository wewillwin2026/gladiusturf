import { NextResponse } from "next/server";
import {
  BL_COOKIE_NAME,
  BL_COOKIE_OPTIONS,
  isCorrectPasscode,
  issueToken,
} from "@/lib/bright-lights/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { passcode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isCorrectPasscode(String(body.passcode || ""))) {
    return NextResponse.json({ error: "Wrong passcode" }, { status: 401 });
  }

  const token = issueToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: BL_COOKIE_NAME,
    value: token,
    ...BL_COOKIE_OPTIONS,
  });
  return res;
}
