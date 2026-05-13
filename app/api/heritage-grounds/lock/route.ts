import { NextResponse } from "next/server";
import {
  HG_COOKIE_NAME,
  HG_COOKIE_OPTIONS,
} from "@/lib/heritage-grounds/auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: HG_COOKIE_NAME,
    value: "",
    ...HG_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return res;
}
