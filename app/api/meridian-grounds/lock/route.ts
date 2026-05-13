import { NextResponse } from "next/server";
import { MG_COOKIE_NAME, MG_COOKIE_OPTIONS } from "@/lib/meridian-grounds/auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: MG_COOKIE_NAME,
    value: "",
    ...MG_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return res;
}
