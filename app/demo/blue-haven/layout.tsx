import type { Metadata } from "next";
import "./blue-haven.css";

export const metadata: Metadata = {
  title: { absolute: "Blue Haven Pool Service — Command (demo)" },
  description:
    "Blue Haven Pool Service · Tampa, FL — a sales-demo pool-service workspace inside Gladius.",
  robots: { index: false, follow: false },
};

export default function BlueHavenRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bh-root min-h-screen">{children}</div>;
}
