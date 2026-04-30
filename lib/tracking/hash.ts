import { createHash } from "node:crypto";

const FALLBACK_SALT = "gladius-tracking-salt-fallback-keep-stable-please";

export function trackingSalt(): string {
  return (process.env.GLADIUS_TRACKING_SALT || FALLBACK_SALT).trim();
}

export function visitorHashFromRequest(
  req: Request,
  fingerprint?: string,
): string {
  const ua = req.headers.get("user-agent") || "";
  const ipHeader =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";
  const salt = trackingSalt();
  return createHash("sha256")
    .update(`${ipHeader}|${ua}|${fingerprint || ""}|${salt}`)
    .digest("hex");
}

export function geoFromRequest(req: Request) {
  return {
    country: req.headers.get("x-vercel-ip-country") || null,
    region: req.headers.get("x-vercel-ip-country-region") || null,
    city: req.headers.get("x-vercel-ip-city")
      ? decodeURIComponent(req.headers.get("x-vercel-ip-city")!)
      : null,
  };
}
