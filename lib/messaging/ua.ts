/**
 * Coarse user-agent classifier — returns a low-cardinality bucket name
 * suitable for audit-log persistence without storing fingerprintable
 * raw UA strings. Trust Director's privacy mandate: persisted UA must
 * not enable cross-site re-identification when joined with timestamp +
 * IP-equivalent signals.
 *
 * Buckets: mobile-safari, mobile-chrome, mobile-firefox, ios-app,
 *          android-app, desktop-safari, desktop-chrome, desktop-firefox,
 *          desktop-edge, bot, unknown
 */
export type UaClass =
  | "mobile-safari"
  | "mobile-chrome"
  | "mobile-firefox"
  | "ios-app"
  | "android-app"
  | "desktop-safari"
  | "desktop-chrome"
  | "desktop-firefox"
  | "desktop-edge"
  | "bot"
  | "unknown";

const BOT_RE = /bot|crawler|spider|preview|slack|discord|twitter|facebookexternalhit|whatsapp|telegram|linkedin|skype|mimecast|proofpoint|barracuda/;

export function parseUaClass(ua: string | null | undefined): UaClass {
  if (!ua) return "unknown";
  const lower = ua.toLowerCase();
  if (BOT_RE.test(lower)) return "bot";

  const isMobile = /mobile|android|iphone|ipad|ipod/.test(lower);
  const isAndroid = /android/.test(lower);
  const isIos = /iphone|ipad|ipod/.test(lower);

  if (isIos && /firefox|fxios/.test(lower)) return "mobile-firefox";
  if (isIos && /chrome|crios/.test(lower)) return "mobile-chrome";
  if (isIos && /safari/.test(lower) && !/chrome|crios/.test(lower))
    return "mobile-safari";
  if (isAndroid && /chrome/.test(lower)) return "mobile-chrome";
  if (isAndroid && /firefox/.test(lower)) return "mobile-firefox";
  if (isMobile) return "mobile-chrome";

  if (/edg/.test(lower)) return "desktop-edge";
  if (/firefox/.test(lower)) return "desktop-firefox";
  if (/chrome/.test(lower) && !/edg/.test(lower)) return "desktop-chrome";
  if (/safari/.test(lower)) return "desktop-safari";
  return "unknown";
}

/**
 * Returns true if the UA suggests an automated/preview agent we should
 * skip for stateful side effects (e.g. quote.viewed status flip). Empty
 * UA is treated as bot — humans almost always have a UA.
 */
export function looksLikeBot(ua: string | null | undefined): boolean {
  if (!ua) return true;
  return parseUaClass(ua) === "bot";
}
