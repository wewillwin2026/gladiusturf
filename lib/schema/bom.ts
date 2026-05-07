import { z } from "zod";

/**
 * Engineering Director's P2: proposals.bom is JSONB with no shape
 * enforcement. A column rename, an old row, or a typo upstream silently
 * crashes the public quote page. This module is the single source of
 * truth for the shape; every read + write site should parse through it.
 *
 * Strategy:
 *   - Strict schema for writes (rejects unknown fields hard).
 *   - Lenient schema for reads (passes through unknown fields, fills
 *     defaults for missing optional ones, never throws).
 *
 * Bumping the shape: add a new optional field, ship for a release,
 * then promote to required in the strict schema once backfilled.
 */

export const LineItemSchema = z.object({
  description: z.string().min(1).max(200),
  qty: z.number().min(0),
  unit_price_cents: z.number().int().min(0),
});

export const QuestionSchema = z.object({
  at: z.string(),
  text: z.string().min(1).max(2000),
});

/** Strict shape used at write time. */
export const BomWriteSchema = z
  .object({
    title: z.string().min(1).max(200),
    notes: z.string().max(4000).nullable().optional(),
    items: z.array(LineItemSchema).max(100).optional(),
    questions: z.array(QuestionSchema).max(50).optional(),
    is_test: z.boolean().optional(),
  })
  .strict();

/** Lenient shape used at read time. */
export const BomReadSchema = z
  .object({
    title: z.string().optional().default("Quote"),
    notes: z.string().nullable().optional(),
    items: z.array(LineItemSchema).optional(),
    questions: z.array(QuestionSchema).optional(),
    is_test: z.boolean().optional(),
  })
  .passthrough();

export type BomWrite = z.infer<typeof BomWriteSchema>;
export type BomRead = z.infer<typeof BomReadSchema>;

/**
 * Parse an arbitrary value into a BomRead, never throws. Returns a safe
 * default if the value is null / not an object / fails validation.
 */
export function parseBomRead(value: unknown): BomRead {
  if (value == null) return { title: "Quote" };
  const result = BomReadSchema.safeParse(value);
  if (result.success) return result.data;
  return { title: "Quote" };
}

/**
 * Validate a BomWrite at the boundary. Throws on malformed input — the
 * caller is expected to map to a friendly error response.
 */
export function validateBomWrite(value: unknown): BomWrite {
  return BomWriteSchema.parse(value);
}
