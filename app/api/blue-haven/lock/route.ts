import { NextResponse } from "next/server";
import { BH_COOKIE_NAME, BH_COOKIE_OPTIONS } from "@/lib/blue-haven/auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: BH_COOKIE_NAME,
    value: "",
    ...BH_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return res;
}
