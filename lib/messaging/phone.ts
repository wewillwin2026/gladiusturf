/**
 * E.164 phone-number normalization.
 *
 * Twilio is strict: the `To` parameter must be a leading-+ country-coded
 * number with no separators ("+19412051000"). Most landscape-CRM CSV
 * exports and US data-entry habits give us "(941) 205-1000" or
 * "941.205.1000" or "9412051000" instead. Without normalization, every
 * outbound SMS to those numbers fails silently in the dispatcher and
 * the operator can't tell why.
 *
 * Rules:
 *   - Already E.164 (`+[1-9][0-9]{6,14}`) → return as-is.
 *   - 10 digits, no `+` → assume US, prepend `+1`.
 *   - 11 digits starting with `1` → prepend `+`.
 *   - Otherwise → return null. Don't guess country codes; better to
 *     leave the column blank than send to the wrong country.
 *
 * Returns null on null/blank input. Returns null when the input
 * cannot be confidently normalized.
 */
export function normalizeE164(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  // Strip everything but digits + a leading +.
  const stripped = trimmed.replace(/[^\d+]/g, "");
  if (/^\+[1-9][0-9]{6,14}$/.test(stripped)) return stripped;
  if (/^[0-9]{10}$/.test(stripped)) return `+1${stripped}`;
  if (/^1[0-9]{10}$/.test(stripped)) return `+${stripped}`;
  return null;
}
