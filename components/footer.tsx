import { LogoMark } from "@/components/logo-mark";
import { VERTICALS } from "@/lib/vertical/types";

const PRODUCT_LINKS = [
  { href: "/product", label: "Engines" },
  { href: "/platform", label: "Platform" },
  { href: "/field", label: "Field Crew App" },
  { href: "/portal", label: "Client Portal" },
  { href: "/score", label: "LRI Score" },
  { href: "/surplus-yard", label: "Surplus Yard" },
  { href: "/find-a-crew", label: "Find a Crew" },
];

// Verticals — /lighting is live, the rest are routed waitlist pages.
// Live tile gets a bullet-style indicator inline so the marker is visible
// without needing a separate column.
const VERTICAL_LINKS = VERTICALS.map((v) => ({
  href: v.href,
  label: v.name,
  live: v.status === "live",
}));

const BOOKS_LINKS = [
  { href: "/books", label: "Books" },
  { href: "/payroll", label: "Payroll" },
  { href: "/retention", label: "Retention" },
];

const RESOURCES_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/compare", label: "Compare" },
  { href: "/integrations", label: "Integrations" },
  { href: "/security", label: "Security" },
  { href: "/manifesto", label: "Manifesto" },
];

const COMPANY_LINKS = [
  { href: "/contact", label: "Contact" },
  { href: "/demo", label: "Book a demo" },
  { href: "mailto:founders@gladiusturf.com", label: "Email the founder" },
  { href: "https://gladiusstone.com", label: "GladiusStone" },
  { href: "https://gladiuscrm.com", label: "GladiusCRM" },
];

const VERSUS_LINKS = [
  { href: "/vs/aspire", label: "vs. Aspire" },
  { href: "/vs/lmn", label: "vs. LMN" },
  { href: "/vs/jobber", label: "vs. Jobber" },
  { href: "/vs/service-autopilot", label: "vs. Service Autopilot" },
  { href: "/vs/servicetitan", label: "vs. ServiceTitan" },
];

const LEGAL_LINKS = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/dpa", label: "DPA" },
  { href: "/legal/security", label: "Security" },
  { href: "/transparency", label: "Transparency" },
];

function Column({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; live?: boolean }[];
}) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bone/65">
        {title}
      </h4>
      <ul className="mt-5 flex flex-col gap-3 text-[14px]">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="inline-flex items-center gap-1.5 text-bone/70 transition-colors hover:text-champagne-bright"
            >
              {l.label}
              {l.live && (
                <span
                  aria-label="Live"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-honey-bright"
                />
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-bone/10 bg-pitch text-bone">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-8">
          <div className="col-span-2 md:col-span-2">
            <LogoMark size={56} theme="dark" tone="bone" withWordmark />
            <p className="mt-6 max-w-xs text-[13px] leading-[1.6] text-bone/75">
              All-in-one software for landscape companies. Answers the
              phones, sends the quotes, dispatches the crews, and chases the
              invoices — so you can run the business.
            </p>
            <div className="mt-6 flex items-center gap-4 text-[12px] text-bone/65">
              <a
                href="https://x.com/gladiusturf"
                aria-label="GladiusTurf on X"
                className="transition-colors hover:text-champagne-bright"
              >
                X
              </a>
              <span aria-hidden className="text-bone/20">
                ·
              </span>
              <a
                href="https://www.linkedin.com/company/gladiusturf"
                aria-label="GladiusTurf on LinkedIn"
                className="transition-colors hover:text-champagne-bright"
              >
                LinkedIn
              </a>
              <span aria-hidden className="text-bone/20">
                ·
              </span>
              <a
                href="https://www.youtube.com/@gladiusturf"
                aria-label="GladiusTurf on YouTube"
                className="transition-colors hover:text-champagne-bright"
              >
                YouTube
              </a>
              <span aria-hidden className="text-bone/20">
                ·
              </span>
              <a
                href="https://www.instagram.com/gladiuscrm/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gladius on Instagram"
                className="transition-colors hover:text-champagne-bright"
              >
                Instagram
              </a>
            </div>
          </div>
          <Column title="Verticals" links={VERTICAL_LINKS} />
          <Column title="Product" links={PRODUCT_LINKS} />
          <Column title="Books" links={BOOKS_LINKS} />
          <Column title="Resources" links={RESOURCES_LINKS} />
          <Column title="Company" links={COMPANY_LINKS} />
          <Column title="Versus" links={VERSUS_LINKS} />
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-bone/10 pt-10 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <p className="text-[12px] text-bone/70">
              © {new Date().getFullYear()} Gladius Inc. · Built for crew owners.
            </p>
            <ul className="flex items-center gap-4 text-[12px] text-bone/70">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="transition-colors hover:text-champagne-bright"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/founders/login"
              className="text-[11px] uppercase tracking-[0.2em] text-bone/30 transition-colors hover:text-champagne-bright"
              aria-label="Founders log in"
            >
              ◆
            </a>
            <p className="font-serif text-[14px] italic text-champagne-bright">
              Not a CRM
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
