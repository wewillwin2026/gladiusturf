/**
 * Structured logger — Engineering Director's P2.
 *
 * Replaces ad-hoc `console.warn("X failed (non-fatal)", err)` patterns
 * scattered across the codebase. Output is plain text (Vercel Logs
 * indexes plain text well) but every line includes a JSON blob with
 * surface, kind, and tenant_id so the operator can grep for
 * '"surface":"quote.accept"' or '"tenant_id":"abc-..."' instead of
 * eyeballing free text.
 *
 * No external dependency. When we move to Vercel Log Drains, the
 * shape on the wire is already the right one.
 */

export type LogLevel = "info" | "warn" | "error";

export type LogContext = {
  /** Stable surface identifier — e.g. "quote.accept", "dispatch.sms". */
  surface: string;
  /** Optional kind sub-classifier ("non_fatal" | "lookup_failure" | etc). */
  kind?: string;
  tenantId?: string | null;
  customerId?: string | null;
  /** Free-form structured fields. */
  [key: string]: unknown;
};

function safeJson(payload: unknown): string {
  try {
    return JSON.stringify(payload);
  } catch {
    // Circular ref or unserializable value — fall back to a tagged
    // string so the warn line still lands instead of throwing.
    return '{"_serialize_error":true}';
  }
}

function emit(level: LogLevel, message: string, ctx: LogContext): void {
  const payload = {
    level,
    message,
    surface: ctx.surface,
    kind: ctx.kind ?? null,
    tenant_id: ctx.tenantId ?? null,
    customer_id: ctx.customerId ?? null,
    ...Object.fromEntries(
      Object.entries(ctx).filter(
        ([k]) =>
          !["surface", "kind", "tenantId", "customerId"].includes(k),
      ),
    ),
    at: new Date().toISOString(),
  };
  // Emit as one line so Vercel/Logflare pick it up cleanly.
  const line = `[gt] ${level} ${ctx.surface} ${message} ${safeJson(payload)}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info(message: string, ctx: LogContext): void {
    emit("info", message, ctx);
  },
  warn(message: string, ctx: LogContext): void {
    emit("warn", message, ctx);
  },
  error(message: string, ctx: LogContext): void {
    emit("error", message, ctx);
  },
};
