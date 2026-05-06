"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/app/ui/Button";
import { Input, Textarea } from "@/components/app/ui/Input";
import { createCustomer } from "../actions";

interface Props {
  tenantBilingual: boolean;
  defaultLanguage: "en" | "es";
}

export function CustomerForm({ tenantBilingual, defaultLanguage }: Props) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [street, setStreet] = React.useState("");
  const [city, setCity] = React.useState("");
  const [stateField, setStateField] = React.useState("FL");
  const [zip, setZip] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [language, setLanguage] = React.useState<"en" | "es">(defaultLanguage);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!name.trim()) {
      toast.error("Customer name is required.");
      return;
    }
    setBusy(true);
    try {
      const res = await createCustomer({
        display_name: name,
        primary_email: email || null,
        primary_phone: phone || null,
        street: street || null,
        city: city || null,
        state: stateField || null,
        zip: zip || null,
        notes: notes || null,
        preferred_language: language,
      });
      if ("error" in res) {
        toast.error(
          res.error === "missing_name"
            ? "Customer name is required."
            : "Could not save the customer. Try again or email founders@gladiusturf.com.",
        );
        return;
      }
      toast.success(`Added ${name}`);
      router.push(`/app/customers/${res.customerId}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
      <div className="g-card p-5 flex flex-col gap-4">
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Customer name *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sarasota Bay Property"
            autoFocus
            required
            className="mt-1.5"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@example.com"
              autoComplete="email"
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Phone
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(941) 555-0124"
              autoComplete="tel"
              className="mt-1.5"
            />
          </div>
        </div>

        {tenantBilingual && (
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              Preferred language
            </label>
            <div className="mt-1.5 flex gap-2">
              {(["en", "es"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={
                    language === l
                      ? "h-8 px-3 rounded-md text-[12px] font-medium bg-g-accent text-black"
                      : "h-8 px-3 rounded-md text-[12px] font-medium bg-g-surface-2 text-g-text-muted hover:text-g-text"
                  }
                >
                  {l === "en" ? "English" : "Español"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="g-card p-5 flex flex-col gap-4">
        <h3 className="text-[14px] font-medium text-g-text">Service address</h3>
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Street
          </label>
          <Input
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="2840 Coastal Oak Dr"
            autoComplete="street-address"
            className="mt-1.5"
          />
        </div>
        <div className="grid gap-4 grid-cols-3">
          <div className="col-span-2">
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              City
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Sarasota"
              autoComplete="address-level2"
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
              State
            </label>
            <Input
              value={stateField}
              onChange={(e) => setStateField(e.target.value)}
              placeholder="FL"
              autoComplete="address-level1"
              className="mt-1.5"
              maxLength={2}
            />
          </div>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
            Zip
          </label>
          <Input
            inputMode="numeric"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="34234"
            autoComplete="postal-code"
            maxLength={10}
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="g-card p-5">
        <label className="text-[11px] uppercase tracking-[0.12em] text-g-text-faint">
          Notes (optional)
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything you want a future you to remember about this property."
          className="mt-1.5"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/app/customers")}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={busy || !name.trim()}>
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              Add customer
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
