import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import { UtmCapture } from "@/components/utm-capture";
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
    "Thirty-three revenue engines across five tiers for landscape crew owners. Flat per-crew pricing. Not a CRM.",
  openGraph: {
    type: "website",
    siteName: "GladiusTurf",
    title: "GladiusTurf — Landscaping Revenue Intelligence",
    description:
      "Thirty-three revenue engines across five tiers for landscape crew owners. Flat per-crew pricing. Not a CRM.",
    images: [{ url: "/crest.png", width: 600, height: 800 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GladiusTurf — Landscaping Revenue Intelligence",
    description:
      "Thirty-three revenue engines. Flat per-crew pricing. Not a CRM.",
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
      <body>
        {children}
        <UtmCapture />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script
            src="https://plausible.io/js/script.tagged-events.js"
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
