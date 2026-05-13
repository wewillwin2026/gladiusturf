import type { Metadata } from "next";
import "./heritage-grounds.css";

export const metadata: Metadata = {
  title: { absolute: "Heritage Grounds — Studio (demo)" },
  description:
    "Heritage Grounds · Bradenton, FL — a sales-demo landscape design-build workspace inside Gladius.",
  robots: { index: false, follow: false },
};

export default function HeritageGroundsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="hg-root min-h-screen">{children}</div>;
}
