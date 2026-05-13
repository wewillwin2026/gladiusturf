import type { Metadata } from "next";
import "./aquaflow.css";

export const metadata: Metadata = {
  title: { absolute: "Aquaflow Irrigation — Command (demo)" },
  description:
    "Aquaflow Irrigation · St. Petersburg, FL — a sales-demo irrigation workspace inside Gladius.",
  robots: { index: false, follow: false },
};

export default function AquaflowRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="af-root min-h-screen">{children}</div>;
}
