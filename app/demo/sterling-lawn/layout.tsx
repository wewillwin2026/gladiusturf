import type { Metadata } from "next";
import "./sterling-lawn.css";

export const metadata: Metadata = {
  title: { absolute: "Sterling Lawn Co — Command Center (demo)" },
  description:
    "Sterling Lawn Co · Tampa, FL — a sales-demo lawn-care workspace inside Gladius.",
  robots: { index: false, follow: false },
};

export default function SterlingLawnRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="sl-root min-h-screen">{children}</div>;
}
