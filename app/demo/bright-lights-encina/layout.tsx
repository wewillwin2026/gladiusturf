import type { Metadata } from "next";
import "./bright-lights.css";

export const metadata: Metadata = {
  title: { absolute: "Bright Lights — Command Center" },
  description:
    "Bright Lights Landscape Lighting · Command Center. Sarasota, FL.",
  robots: { index: false, follow: false },
};

export default function BrightLightsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bl-root min-h-screen">{children}</div>;
}
