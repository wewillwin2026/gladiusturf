/**
 * Verticals served by Gladius. /lighting is the only one with a live product
 * surface today; the others are routed waitlist pages built per
 * ~/Downloads/gladius_lighting_prompt.md.
 */

import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  Flower2,
  Lightbulb,
  Snowflake,
  Sprout,
  TreePine,
  Trees,
  Waves,
} from "lucide-react";

export type VerticalSlug =
  | "lawn-care"
  | "landscape"
  | "lighting"
  | "pool"
  | "irrigation"
  | "tree-care"
  | "snow"
  | "commercial";

export type VerticalStatus = "live" | "waitlist";

export type VerticalDef = {
  slug: VerticalSlug;
  name: string;
  href: string;
  icon: LucideIcon;
  status: VerticalStatus;
  /** Order in the ecosystem strip — left to right. */
  ordinal: number;
};

/**
 * Canonical 8-vertical lineup. Render order follows `ordinal`.
 * Lighting is sandwiched between Landscape and Pool deliberately — it's the
 * "live" tile, so anchor visitors notice it without it being first.
 */
export const VERTICALS: VerticalDef[] = [
  { slug: "lawn-care", name: "Lawn Care", href: "/lawn-care", icon: Sprout, status: "waitlist", ordinal: 1 },
  { slug: "landscape", name: "Landscape", href: "/landscape", icon: Flower2, status: "waitlist", ordinal: 2 },
  { slug: "lighting", name: "Lighting", href: "/lighting", icon: Lightbulb, status: "live", ordinal: 3 },
  { slug: "pool", name: "Pool", href: "/pool", icon: Waves, status: "waitlist", ordinal: 4 },
  { slug: "irrigation", name: "Irrigation", href: "/irrigation", icon: Trees, status: "waitlist", ordinal: 5 },
  { slug: "tree-care", name: "Tree Care", href: "/tree-care", icon: TreePine, status: "waitlist", ordinal: 6 },
  { slug: "snow", name: "Snow", href: "/snow", icon: Snowflake, status: "waitlist", ordinal: 7 },
  { slug: "commercial", name: "Commercial", href: "/commercial", icon: Building2, status: "waitlist", ordinal: 8 },
];

export const VERTICAL_SLUGS = VERTICALS.map((v) => v.slug);

export function getVertical(slug: VerticalSlug): VerticalDef {
  const v = VERTICALS.find((x) => x.slug === slug);
  if (!v) throw new Error(`Unknown vertical: ${slug}`);
  return v;
}

/** Shared briefcase/sales icon for misc usages. */
export const VerticalsIcon = Briefcase;
