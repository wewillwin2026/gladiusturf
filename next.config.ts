import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  outputFileTracingIncludes: {
    "/api/contract/bright-lights/sign": [
      "./public/contracts/bright-lights-proposal-agreement.pdf",
    ],
  },
};

export default config;
