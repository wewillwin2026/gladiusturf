import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gladiusturf.com"),
  title: {
    default: "GladiusTurf — Landscaping Revenue Intelligence",
    template: "%s · GladiusTurf",
  },
  description:
    "The $180,000 your crew is leaving in the grass every year. Seven revenue engines for landscape crew owners. Flat per-crew pricing.",
  openGraph: {
    type: "website",
    siteName: "GladiusTurf",
    url: "https://gladiusturf.com",
    title: "GladiusTurf — Landscaping Revenue Intelligence",
    description:
      "Seven revenue engines for landscape crew owners. Flat per-crew pricing. Not a CRM.",
    images: [{ url: "/crest.png", width: 600, height: 800 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GladiusTurf — Landscaping Revenue Intelligence",
    description: "Seven revenue engines. Flat per-crew pricing. Not a CRM.",
    images: ["/crest.png"],
  },
  icons: {
    icon: "/crest.png",
    apple: "/crest.png",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
