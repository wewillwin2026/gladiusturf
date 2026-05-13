import { NextResponse } from "next/server";
import { TC_COOKIE_NAME, TC_COOKIE_OPTIONS } from "@/lib/timbercare/auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: TC_COOKIE_NAME,
    value: "",
    ...TC_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return res;
}
