import type { Metadata } from "next";
import "./meridian-grounds.css";

export const metadata: Metadata = {
  title: { absolute: "Meridian Commercial Grounds — Command (demo)" },
  description:
    "Meridian Commercial Grounds · Tampa, FL — a sales-demo commercial-grounds workspace inside Gladius.",
  robots: { index: false, follow: false },
};

export default function MeridianRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mg-root min-h-screen">{children}</div>;
}
