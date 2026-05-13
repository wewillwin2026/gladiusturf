import { NextResponse } from "next/server";
import { SL_COOKIE_NAME, SL_COOKIE_OPTIONS } from "@/lib/sterling-lawn/auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: SL_COOKIE_NAME,
    value: "",
    ...SL_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return res;
}
