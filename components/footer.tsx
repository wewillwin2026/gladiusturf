import { LogoMark } from "@/components/logo-mark";

const PRODUCT_LINKS = [
  { href: "/product", label: "Seven engines" },
  { href: "/pricing", label: "Pricing" },
  { href: "/compare", label: "Compare" },
  { href: "/surplus-yard", label: "Surplus Yard" },
];

const RESOURCES_LINKS = [
  { href: "/manifesto", label: "Manifesto" },
  { href: "/find-a-crew", label: "Find a crew" },
  { href: "/demo", label: "Book a demo" },
];

const COMPANY_LINKS = [
  { href: "mailto:founders@gladiusturf.com", label: "Email the founder" },
  { href: "tel:+18134420253", label: "Call (813) 442-0253" },
  { href: "https://gladiusstone.com", label: "GladiusStone" },
  { href: "https://gladiuscrm.com", label: "GladiusCRM" },
];

const LEGAL_LINKS = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/security", label: "Security" },
];

function Column({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bone/50">
        {title}
      </h4>
      <ul className="mt-5 flex flex-col gap-3 text-[14px]">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="text-bone/70 transition-colors hover:text-moss-bright"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-bone/10 bg-forest-deep text-bone">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-5">
          <div className="col-span-2 md:col-span-2">
            <LogoMark size={40} theme="dark" tone="bone" withWordmark />
            <p className="mt-6 max-w-xs text-[13px] leading-[1.6] text-bone/60">
              Landscaping Revenue Intelligence. Seven engines for crew owners
              done leaking revenue to the gaps in their software.
            </p>
            <div className="mt-6 flex items-center gap-4 text-[12px] text-bone/50">
              <a
                href="https://x.com/gladiusturf"
                aria-label="GladiusTurf on X"
                className="transition-colors hover:text-moss-bright"
              >
                X
              </a>
              <span aria-hidden className="text-bone/20">
                ·
              </span>
              <a
                href="https://www.linkedin.com/company/gladiusturf"
                aria-label="GladiusTurf on LinkedIn"
                className="transition-colors hover:text-moss-bright"
              >
                LinkedIn
              </a>
              <span aria-hidden className="text-bone/20">
                ·
              </span>
              <a
                href="https://www.youtube.com/@gladiusturf"
                aria-label="GladiusTurf on YouTube"
                className="transition-colors hover:text-moss-bright"
              >
                YouTube
              </a>
            </div>
          </div>
          <Column title="Product" links={PRODUCT_LINKS} />
          <Column title="Resources" links={RESOURCES_LINKS} />
          <Column title="Company" links={COMPANY_LINKS} />
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-bone/10 pt-10 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <p className="text-[12px] text-bone/50">
              © {new Date().getFullYear()} Gladius Inc. · Built for crew owners.
            </p>
            <ul className="flex items-center gap-4 text-[12px] text-bone/50">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="transition-colors hover:text-moss-bright"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <p className="font-serif text-[14px] italic text-moss-bright">
            Not a CRM
          </p>
        </div>
      </div>
    </footer>
  );
}
