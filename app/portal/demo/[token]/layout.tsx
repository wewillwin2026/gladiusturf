import type { Metadata } from "next";
import { PORTAL_DEMO } from "@/content/portal-demo";
import { PortalShell } from "@/components/portal/portal-shell";

export const metadata: Metadata = {
  title: "Customer Portal Preview",
  description:
    "A live, click-through preview of the GladiusTurf Client Portal — what your customers see when they reschedule, pay, and approve.",
  robots: { index: false, follow: false },
};

export default function PortalDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      crewName={PORTAL_DEMO.crew.name}
      crewInitials={PORTAL_DEMO.crew.initials}
      customerFirstName={PORTAL_DEMO.customer.firstName}
      customerLastName={PORTAL_DEMO.customer.lastName}
      customerEmail={PORTAL_DEMO.customer.email}
      active="dashboard"
    >
      {children}
    </PortalShell>
  );
}
