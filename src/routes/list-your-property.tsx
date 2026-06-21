import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { COLLEGES } from "@/lib/data";
import { directSupabase } from "@/lib/directSupabase";
import { CheckCircle2, Home } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/list-your-property")({
  head: () => ({
    meta: [
      { title: "List Your Property — DUNest" },
      {
        name: "description",
        content: "Submit your PG or flat on DUNest. Reach thousands of Delhi University students looking for housing.",
      },
    ],
  }),
  component: ListYourPropertyPage,
});

const initial = {
  type: "pg",
  name: "",
  locality: "",
  college: COLLEGES[0] as string,
  rent: "",
  walk_min: "",
  gender: "co-ed",
  curfew: "",
  ac: "no",
  wifi: "no",
  sharers: "",
  food_type: "",
  metro_station: "",
  metro_walk_min: "",
  deposit: "",
  owner_name: "",
  whatsapp: "",
  notes: "",
};

const optionalInt = (v: string) => {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function ListYourPropertyPage() {
  const [form, setForm] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const upd = (k: keyof typeof initial, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  if (submitted) {
    return (
      <div className="bg-navy-soft min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="bg-white border border-border rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-accent text-brand-green-dark flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-2xl font-bold mt-4">Thank you!</h2>
          <p className="text-muted-foreground mt-2">
            Your listing has been submitted and will be reviewed within 24 hours.
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm(initial); }}
            className="mt-6 bg-brand-green hover:bg-brand-green-dark text-white font-semibold px-6 py-3 rounded-xl"
          >
            Submit another listing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy-soft min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent border border-brand-green/20 text-xs font-medium text-brand-green-dark mb-4">
            <Home size={12} /> Free listing
          </div>
          <h1 className="text-3xl font-bold">List Your Property on DUNest</h1>
          <p className="text-muted-foreground mt-2">
            Reach thousands of Delhi University students. Free to list — verified and published within 24 hours.
          </p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (saving) return;
            const missing: string[] = [];
            if (!form.name) missing.push("property name");
            if (!form.rent) missing.push("rent");
            if (!form.owner_name) missing.push("your name");
            if (!form.whatsapp) missing.push("WhatsApp number");
            if (missing.length) {
              toast.error(`Please fill in: ${missing.join(", ")}`);
              return;
            }
            setSaving(true);
            try {
              const { error } = await directSupabase.from("listings").insert({
                status: "pending",
                type: form.type,
                name: form.name,
                locality: form.locality,
                college: form.college,
                rent: optionalInt(form.rent),
                walk_min: optionalInt(form.walk_min),
                gender: form.gender,
                curfew: form.curfew,
                ac: form.ac,
                wifi: form.wifi,
                sharers: optionalInt(form.sharers),
                food_type: form.food_type,
                metro_station: form.metro_station,
                metro_walk_min: optionalInt(form.metro_walk_min),
                deposit: optionalInt(form.deposit),
                owner_name: form.owner_name,
                whatsapp: form.whatsapp,
                notes: form.notes,
              });
              if (error) throw error;
              setSubmitted(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            } catch (err) {
              toast.error(err instanceof Error ? err.message : String(err));
            } finally {
              setSaving(false);
            }
          }}
          className="space-y-6"
        >
          {/* Property details */}
          <Section title="1. Property details">
            <Sel
              label="Type *"
              value={form.type}
              onChange={(v) => upd("type", v)}
              options={[
                { value: "pg", label: "PG" },
                { value: "flat", label: "Flat" },
              ]}
            />
            <Inp label="Property name *" value={form.name} onChange={(v) => upd("name", v)} />
            <Inp label="Locality / area" value={form.locality} onChange={(v) => upd("locality", v)} />
            <Sel
              label="Nearest DU college"
              value={form.college}
              onChange={(v) => upd("college", v)}
              options={COLLEGES.map((c) => ({ value: c, label: c }))}
            />
            <Inp type="number" label="Monthly rent (₹) *" value={form.rent} onChange={(v) => upd("rent", v)} />
            <Inp type="number" label="Walk to college (min)" value={form.walk_min} onChange={(v) => upd("walk_min", v)} />
            <Sel
              label="Gender policy"
              value={form.gender}
              onChange={(v) => upd("gender", v)}
              options={[
                { value: "boys only", label: "Boys only" },
                { value: "girls only", label: "Girls only" },
                { value: "co-ed", label: "Co-ed" },
              ]}
            />
            <Inp label="Curfew (e.g. 10 PM or None)" value={form.curfew} onChange={(v) => upd("curfew", v)} />
            <Sel
              label="AC"
              value={form.ac}
              onChange={(v) => upd("ac", v)}
              options={[
                { value: "no", label: "No" },
                { value: "yes", label: "Yes" },
              ]}
            />
            <Sel
              label="WiFi / Internet"
              value={form.wifi}
              onChange={(v) => upd("wifi", v)}
              options={[
                { value: "no", label: "No" },
                { value: "yes", label: "Yes" },
                { value: "included", label: "Included in rent" },
              ]}
            />
            {form.type === "flat" && (
              <Inp type="number" label="No. of sharers" value={form.sharers} onChange={(v) => upd("sharers", v)} />
            )}
            <Inp label="Food arrangement" value={form.food_type} onChange={(v) => upd("food_type", v)} placeholder="e.g. Included, Tiffin, None" />
          </Section>

          {/* Transport */}
          <Section title="2. Transport">
            <Inp label="Nearest metro station" value={form.metro_station} onChange={(v) => upd("metro_station", v)} />
            <Inp type="number" label="Walk to metro (min)" value={form.metro_walk_min} onChange={(v) => upd("metro_walk_min", v)} />
            <Inp type="number" label="Deposit (₹)" value={form.deposit} onChange={(v) => upd("deposit", v)} />
          </Section>

          {/* Owner contact */}
          <Section title="3. Your contact">
            <Inp label="Your name *" value={form.owner_name} onChange={(v) => upd("owner_name", v)} />
            <Inp label="WhatsApp number *" value={form.whatsapp} onChange={(v) => upd("whatsapp", v)} placeholder="10-digit number" />
            <div className="sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Additional notes / rules
              </span>
              <textarea
                value={form.notes}
                onChange={(e) => upd("notes", e.target.value)}
                rows={3}
                placeholder="Availability date, special rules, any other details..."
                className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40"
              />
            </div>
          </Section>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-bold py-4 rounded-xl text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Submitting…" : "Submit listing — it's free"}
          </button>
          <p className="text-xs text-center text-muted-foreground">
            By submitting you confirm the information is accurate. Every listing is verified before publishing.
          </p>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="bg-white border border-border rounded-2xl p-5 sm:p-6">
      <legend className="px-2 text-sm font-bold uppercase tracking-wider text-brand-green-dark">{title}</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">{children}</div>
    </fieldset>
  );
}

function Inp({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40"
      />
    </label>
  );
}

function Sel({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
