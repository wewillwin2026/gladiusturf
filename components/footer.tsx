import { LogoMark } from "@/components/logo-mark";

const PRODUCT_LINKS = [
  { href: "/product", label: "Seven engines" },
  { href: "/pricing", label: "Pricing" },
  { href: "/compare", label: "Compare" },
  { href: "/surplus-yard", label: "Surplus Yard" },
  { href: "/find-a-crew", label: "Find a crew" },
];

const COMPANY_LINKS = [
  { href: "/manifesto", label: "Manifesto" },
  { href: "/demo", label: "Request a demo" },
  { href: "mailto:founders@gladiusturf.com", label: "Email the founder" },
];

const SISTER_LINKS = [
  { href: "https://gladiusstone.com", label: "GladiusStone" },
  { href: "https://gladiuscrm.com", label: "GladiusCRM" },
  { href: "https://gofetchauto.com", label: "GoFetchAuto" },
];

function Column({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-[12px] uppercase tracking-[0.15em] text-bone/50">{title}</h4>
      <ul className="mt-5 flex flex-col gap-3 text-[14px]">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="text-bone/80 hover:text-moss">
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
    <footer className="bg-obsidian text-bone">
      <div className="mx-auto max-w-content px-6 py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <LogoMark size={40} tone="moss" withWordmark />
            <p className="mt-6 text-[13px] leading-[1.6] text-bone/60">
              Landscaping Revenue Intelligence. A Gladius Inc. product built
              for crew owners who are done leaking revenue.
            </p>
          </div>
          <Column title="Product" links={PRODUCT_LINKS} />
          <Column title="Company" links={COMPANY_LINKS} />
          <Column title="Sister products" links={SISTER_LINKS} />
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-bone/10 pt-10 md:flex-row md:items-center md:justify-between">
          <p className="text-[12px] text-bone/50">
            GladiusTurf · a Gladius Inc. product · built for landscape operators
          </p>
          <p className="font-serif text-[14px] italic text-moss">Not a CRM</p>
        </div>
      </div>
    </footer>
  );
}
