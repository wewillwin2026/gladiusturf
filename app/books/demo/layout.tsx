import type { Metadata } from "next";
import { SandboxBanner } from "@/components/books-sandbox/sandbox-banner";
import { SandboxTopBar } from "@/components/books-sandbox/sandbox-topbar";

export const metadata: Metadata = {
  title: "Books Sandbox · Owner Console Preview",
  description:
    "A click-through preview of the GladiusTurf Books module — what running your landscape shop's books inside Gladius actually looks like.",
  robots: { index: false, follow: false },
};

export default function BooksDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-pitch text-bone">
      <SandboxBanner />
      <SandboxTopBar />
      <main className="mx-auto w-full max-w-content px-4 py-8 md:px-6 md:py-10">
        {children}
      </main>
    </div>
  );
}
