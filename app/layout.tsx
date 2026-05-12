import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { TrackingScript } from "@/components/tracking-script";
import { UtmCapture } from "@/components/utm-capture";
import "./globals.css";
import "./(app-and-founders)/app.css";

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
    default: "GladiusTurf — All-in-one software for landscape companies",
    template: "%s · GladiusTurf",
  },
  description:
    "All-in-one software for landscape companies. Answers the phones, sends the quotes, dispatches the crews, and chases the invoices — so you can run the business. Per-crew pricing, 30-day money-back.",
  openGraph: {
    type: "website",
    siteName: "GladiusTurf",
    title: "GladiusTurf — All-in-one software for landscape companies",
    description:
      "Phones, quotes, crews, invoices — one tool, not seven. Per-crew pricing, 30-day money-back, no fight.",
    images: [{ url: "/crest.png", width: 600, height: 800 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GladiusTurf — All-in-one software for landscape companies",
    description:
      "Phones, quotes, crews, invoices — one tool, not seven. Per-crew pricing, 30-day money-back.",
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
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>
        {children}
        <TrackingScript />
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
