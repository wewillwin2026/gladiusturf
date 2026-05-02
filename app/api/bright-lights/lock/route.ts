import { NextResponse } from "next/server";
import { BL_COOKIE_NAME, BL_COOKIE_OPTIONS } from "@/lib/bright-lights/auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: BL_COOKIE_NAME,
    value: "",
    ...BL_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return res;
}
