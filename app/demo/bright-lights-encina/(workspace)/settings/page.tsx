import { Crown, Languages, MapPin, Phone, Wrench } from "lucide-react";
import { BRAND } from "@/lib/demo-data/bright-lights";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <span className="bl-eyebrow-muted">Workspace · Settings</span>
        <h1
          className="bl-serif mt-1 text-[28px] leading-[1.1]"
          style={{ color: "var(--bl-text)" }}
        >
          Settings
        </h1>
        <p
          className="mt-2 max-w-xl text-[13px] leading-[1.6]"
          style={{ color: "var(--bl-text-muted)" }}
        >
          Pre-filled from your public business profile. We&rsquo;ll confirm
          everything during the Monday onboarding call before you go live with
          customers.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px]">
        <div className="bl-card overflow-hidden">
          <header
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--bl-border)" }}
          >
            <span className="bl-eyebrow">Team</span>
            <span
              className="text-[11px]"
              style={{ color: "var(--bl-text-faint)" }}
            >
              2 seats · Professional tier
            </span>
          </header>
          <ul>
            {[
              {
                name: BRAND.founder,
                role: "Owner",
                email: BRAND.email,
                roleColor: "var(--bl-accent)",
                icon: Crown,
              },
              {
                name: BRAND.operator,
                role: "Operator",
                email: "felipe.encina@brightlightslandscapelighting.com",
                roleColor: "var(--bl-info)",
                icon: Wrench,
              },
            ].map((m, i) => (
              <li
                key={m.email}
                className="flex items-center gap-3 px-5 py-4"
                style={{
                  borderBottom: i === 0 ? "1px solid var(--bl-border)" : "none",
                }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(244,184,96,0.18)",
                    color: m.roleColor,
                    border: `1px solid ${m.roleColor}55`,
                  }}
                >
                  <m.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="flex items-center gap-2 text-[13px]"
                    style={{ color: "var(--bl-text)" }}
                  >
                    {m.name}
                    <span
                      className="bl-pill"
                      style={{
                        fontSize: 10,
                        color: m.roleColor,
                        borderColor: `${m.roleColor}55`,
                        background: `${m.roleColor}1A`,
                      }}
                    >
                      {m.role}
                    </span>
                  </div>
                  <div
                    className="bl-mono text-[11px]"
                    style={{ color: "var(--bl-text-faint)" }}
                  >
                    {m.email}
                  </div>
                </div>
                <button
                  type="button"
                  className="bl-btn-ghost"
                  style={{ fontSize: 11, padding: "4px 10px" }}
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
          <div
            className="px-5 py-3 text-[11px]"
            style={{
              borderTop: "1px solid var(--bl-border)",
              color: "var(--bl-text-faint)",
            }}
          >
            Add seat upgrade — Professional includes 2 seats. Add more on
            Monday onboarding.
          </div>
        </div>

        <div className="bl-card p-5">
          <span className="bl-eyebrow">Workspace defaults</span>
          <ul className="mt-3 flex flex-col gap-3 text-[12px]">
            <SettingRow
              icon={Languages}
              label="Customer language default"
              value="English (with Spanish auto-detect)"
            />
            <SettingRow
              icon={MapPin}
              label="Service area"
              value={BRAND.serviceArea}
            />
            <SettingRow
              icon={MapPin}
              label="Showroom"
              value={BRAND.showroom}
            />
            <SettingRow
              icon={MapPin}
              label="Yard / mailing"
              value={BRAND.yard}
            />
            <SettingRow icon={Phone} label="Primary line" value={BRAND.phone} />
          </ul>
        </div>
      </section>

      <section className="bl-card p-5">
        <span className="bl-eyebrow">Business</span>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Legal name" value={BRAND.name} />
          <Field label="DBA" value={BRAND.shortName} />
          <Field label="Founded" value={BRAND.founded} />
          <Field label="Listed hours" value={BRAND.hours} />
          <Field
            label="Brands installed"
            value="Cast Lighting · Unique Lighting Systems"
          />
          <Field
            label="Reviews · Google"
            value={`${BRAND.reviewCount} · ${BRAND.reviewStars.toFixed(1)} ★`}
          />
        </div>
      </section>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon
        className="h-3.5 w-3.5 shrink-0"
        style={{ color: "var(--bl-text-faint)", marginTop: 2 }}
      />
      <div className="min-w-0 flex-1">
        <div className="bl-eyebrow-muted">{label}</div>
        <div
          className="mt-0.5 text-[12px] leading-[1.4]"
          style={{ color: "var(--bl-text)" }}
        >
          {value}
        </div>
      </div>
    </li>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="bl-eyebrow-muted">{label}</div>
      <div
        className="mt-1 text-[13px]"
        style={{ color: "var(--bl-text)" }}
      >
        {value}
      </div>
    </div>
  );
}
