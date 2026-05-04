import type { Metadata } from "next";
import { VerticalWaitlist } from "@/components/vertical/VerticalWaitlist";
import { WAITLIST_COPY } from "@/lib/vertical/copy";

const copy = WAITLIST_COPY.irrigation;

export const metadata: Metadata = {
  title: { absolute: copy.title },
  description: copy.description,
  alternates: { canonical: "/irrigation" },
  openGraph: {
    title: copy.title,
    description: copy.description,
    url: "https://gladiusturf.com/irrigation",
    siteName: "GladiusTurf",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: copy.title, description: copy.description },
};

export default function IrrigationPage() {
  return <VerticalWaitlist vertical="irrigation" />;
}
