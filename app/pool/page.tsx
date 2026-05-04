import type { Metadata } from "next";
import { VerticalWaitlist } from "@/components/vertical/VerticalWaitlist";
import { WAITLIST_COPY } from "@/lib/vertical/copy";

const copy = WAITLIST_COPY.pool;

export const metadata: Metadata = {
  title: { absolute: copy.title },
  description: copy.description,
  alternates: { canonical: "/pool" },
  openGraph: {
    title: copy.title,
    description: copy.description,
    url: "https://gladiusturf.com/pool",
    siteName: "GladiusTurf",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: copy.title, description: copy.description },
};

export default function PoolPage() {
  return <VerticalWaitlist vertical="pool" />;
}
