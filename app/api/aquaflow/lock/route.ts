import { NextResponse } from "next/server";
import { AF_COOKIE_NAME, AF_COOKIE_OPTIONS } from "@/lib/aquaflow/auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: AF_COOKIE_NAME,
    value: "",
    ...AF_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return res;
}
