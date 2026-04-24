# GladiusTurf

Landscaping Revenue Intelligence — marketing + product site.

Part of the Gladius Inc. empire (sister products: GladiusStone, GladiusCRM, GoFetchAuto).

## Stack

- Next.js 15 (App Router, RSC)
- TypeScript strict
- Tailwind CSS + shadcn/ui
- Supabase (leads, waitlist)
- Resend (transactional email)
- Vercel (hosting)

## Infra

- **Vercel project**: `gofetchcodes-projects/gladiusturf` (Pro)
- **Supabase project**: `gladiusturf` (ref `dkghawpyolcyarjyihkp`, us-east-1)
- **GitHub**: `wewillwin2026/gladiusturf`
- **Domain**: gladiusturf.com

## Local dev

```bash
cp .env.example .env.local   # fill in keys
npm install
npm run dev
```

## Deploy

Branch previews + production deploy via Vercel Git integration.
