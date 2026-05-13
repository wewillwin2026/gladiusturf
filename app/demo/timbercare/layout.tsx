import type { Metadata } from "next";
import "./timbercare.css";

export const metadata: Metadata = {
  title: { absolute: "TimberCare Co — Command (demo)" },
  description:
    "TimberCare Co · Sarasota, FL — a sales-demo tree-care workspace inside Gladius.",
  robots: { index: false, follow: false },
};

export default function TimbercareRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="tc-root min-h-screen">{children}</div>;
}
