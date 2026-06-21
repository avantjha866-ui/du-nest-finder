import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { COLLEGES } from "@/lib/data";
import { directSupabase } from "@/lib/directSupabase";
import { CheckCircle2, Home } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "List Your Property — DUNest" },
      { name: "description", content: "Submit your PG or flat on DUNest. Reach thousands of Delhi University students." },
    ],
  }),
  component: SubmitPage,
});

const initialForm: Record<string, unknown> = {
  type: "PG",
  name: "",
  locality: "",
  college: COLLEGES[0],
  rent: "",
  rentSingle: "",
  rentDouble: "",
  rentTriple: "",
  walk: "",
  gender: "Co-ed",
  curfew: "",
  room: "Double",
  metroStation: "",
  metroWalk: "",
  metroPass: "",
  deposit: "",
  autoCost: "",
  food: "Included",
  breakfast: "",
  breakfastMenu: "",
  lunch: "",
  lunchMenu: "",
  dinner: "",
  dinnerMenu: "",
  electricity: "Included",
  water: "Included",
  laundry: "",
  internet: "Included",
  ac: false,
  negotiable: "Yes",
  security: [] as string[],
  sharers: 3,
  bhk: "2BHK",
  maid: "",
  cook: "",
  gym: "",
  gymDistance: "",
  gymPrice: "",
  jogging: "",
  market: "",
  hospital: "",
  atm: "",
  pharmacy: "",
  areaDesc: "",
  photoUrls: "",
  ownerName: "",
  whatsapp: "",
  notes: "",
  knownIssues: "",
};

const optionalInt = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const SEC_OPTIONS = ["24x7 Guard", "CCTV all floors", "Biometric entry", "Intercom", "Gated compound"];

function SubmitPage() {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>(() => ({ ...initialForm }));

  const upd = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const toggleSec = (s: string) => {
    const cur = (form.security as string[]) ?? [];
    upd("security", cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]);
  };

  if (submitted) {
    return (
      <div className="bg-navy-soft min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="bg-white border border-border rounded-2xl p-10 max-w-md text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-accent text-brand-green-dark flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-2xl font-bold mt-4">Listing submitted!</h2>
          <p className="text-muted-foreground mt-2">
            Our team will review and verify your listing within 24 hours. We'll contact you on WhatsApp once it's live.
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm({ ...initialForm, security: [] }); }}
            className="mt-5 bg-brand-green hover:bg-brand-green-dark text-white font-semibold px-6 py-3 rounded-xl"
          >
            Submit another listing
          </button>
        </div>
      </div>
    );
  }

  const n = (v: number) => v + 1;
  let sec = 1;

  return (
    <div className="bg-navy-soft min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent border border-brand-green/20 text-xs font-medium text-brand-green-dark mb-4">
            <Home size={12} /> List your property
          </div>
          <h1 className="text-3xl font-bold">Add your PG or Flat on DUNest</h1>
          <p className="text-muted-foreground mt-2">
            Free to list — verified and published within 24 hours. Fill as many details as possible.
          </p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (saving) return;
            const missing: string[] = [];
            if (!form.name) missing.push("property name");
            if (!form.rent && !form.rentDouble) missing.push("rent");
            if (!form.ownerName) missing.push("your name");
            if (!form.whatsapp) missing.push("WhatsApp number");
            if (missing.length) { toast.error(`Please fill: ${missing.join(", ")}`); return; }
            setSaving(true);
            try {
              const baseRent = optionalInt(form.rent) ?? optionalInt(form.rentDouble) ?? 0;
              const notesArr = [
                form.notes ? String(form.notes) : "",
                form.knownIssues ? `Known issues: ${form.knownIssues}` : "",
                form.rentSingle ? `Single: ₹${form.rentSingle}` : "",
                form.rentDouble ? `Double: ₹${form.rentDouble}` : "",
                form.rentTriple ? `Triple: ₹${form.rentTriple}` : "",
                form.photoUrls ? String(form.photoUrls) : "",
              ].filter(Boolean).join(" | ");

              const { error } = await directSupabase.from("listings").insert({
                status: "pending",
                type: String(form.type).toLowerCase(),
                name: String(form.name),
                locality: String(form.locality || ""),
                college: String(form.college || ""),
                rent: baseRent,
                walk_min: optionalInt(form.walk),
                gender: String(form.gender || ""),
                curfew: String(form.curfew || ""),
                ac: form.ac ? "Yes" : "No",
                negotiable: String(form.negotiable),
                security: (form.security as string[]).length > 0 ? form.security : null,
                metro_station: String(form.metroStation || ""),
                metro_walk_min: optionalInt(form.metroWalk),
                metro_fare: optionalInt(form.metroPass),
                auto_cost: optionalInt(form.autoCost),
                food_type: String(form.food || ""),
                breakfast_time: String(form.breakfast || ""),
                breakfast_menu: String(form.breakfastMenu || ""),
                lunch_time: String(form.lunch || ""),
                lunch_menu: String(form.lunchMenu || ""),
                dinner_time: String(form.dinner || ""),
                dinner_menu: String(form.dinnerMenu || ""),
                wifi: String(form.internet || ""),
                electricity: String(form.electricity || ""),
                water: String(form.water || ""),
                laundry: String(form.laundry || ""),
                sharers: form.type === "Flat" ? optionalInt(form.sharers) : null,
                maid_cost: form.maid ? String(form.maid) : null,
                cook_cost: form.cook ? String(form.cook) : null,
                deposit: optionalInt(form.deposit),
                gym_name: String(form.gym || ""),
                gym_distance: String(form.gymDistance || ""),
                gym_price: optionalInt(form.gymPrice),
                jogging: String(form.jogging || ""),
                market: String(form.market || ""),
                hospital: String(form.hospital || ""),
                atm: String(form.atm || ""),
                pharmacy: String(form.pharmacy || ""),
                area_description: String(form.areaDesc || ""),
                owner_name: String(form.ownerName),
                whatsapp: String(form.whatsapp),
                notes: notesArr,
              });
              if (error) throw error;
              setSubmitted(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            } catch (err) {
              console.error(err);
              toast.error(err instanceof Error ? err.message : String(err));
            } finally {
              setSaving(false);
            }
          }}
          className="space-y-6"
        >
          {/* 1. Basic info */}
          <Section title="1. Basic info">
            <Sel label="Listing type" value={form.type as string} onChange={(v) => upd("type", v)} options={["PG", "Flat"]} />
            <Inp label="Property name *" value={form.name as string} onChange={(v) => upd("name", v)} />
            <Inp label="Locality / area" value={form.locality as string} onChange={(v) => upd("locality", v)} />
            <Sel label="Nearest DU college" value={form.college as string} onChange={(v) => upd("college", v)} options={[...COLLEGES]} />
            <Inp type="number" label={form.type === "PG" ? "Base rent ₹/mo (double sharing) *" : "Total flat rent ₹/mo *"} value={form.rent as string} onChange={(v) => upd("rent", v)} />
            <Inp type="number" label="Walk to college (min)" value={form.walk as string} onChange={(v) => upd("walk", v)} />
            <Sel label="Gender policy" value={form.gender as string} onChange={(v) => upd("gender", v)} options={["Girls only", "Boys only", "Co-ed"]} />
            <Inp label="Curfew (e.g. 10 PM or None)" value={form.curfew as string} onChange={(v) => upd("curfew", v)} />
          </Section>

          {/* 2. Room-wise pricing (PG only) */}
          {form.type === "PG" && (
            <Section title="2. Room-wise pricing">
              <Inp type="number" label="Single occupancy ₹/mo" value={form.rentSingle as string} onChange={(v) => upd("rentSingle", v)} />
              <Inp type="number" label="Double sharing ₹/mo" value={form.rentDouble as string} onChange={(v) => upd("rentDouble", v)} />
              <Inp type="number" label="Triple sharing ₹/mo" value={form.rentTriple as string} onChange={(v) => upd("rentTriple", v)} />
            </Section>
          )}

          {/* Flat details */}
          {form.type === "Flat" && (
            <Section title="2. Flat details">
              <Sel label="Flat type" value={form.bhk as string} onChange={(v) => upd("bhk", v)} options={["1BHK", "2BHK", "3BHK"]} />
              <Sel label="Ideal sharers" value={String(form.sharers)} onChange={(v) => upd("sharers", Number(v))} options={["2", "3", "4"]} />
              <Inp type="number" label="Maid ₹/mo" value={form.maid as string} onChange={(v) => upd("maid", v)} />
              <Inp type="number" label="Cook ₹/mo" value={form.cook as string} onChange={(v) => upd("cook", v)} />
            </Section>
          )}

          {/* 3. Transport */}
          <Section title="3. Transport">
            <Inp label="Nearest metro station" value={form.metroStation as string} onChange={(v) => upd("metroStation", v)} />
            <Inp type="number" label="Walk to metro (min)" value={form.metroWalk as string} onChange={(v) => upd("metroWalk", v)} />
            <Inp type="number" label="Monthly metro pass (₹)" value={form.metroPass as string} onChange={(v) => upd("metroPass", v)} />
            <Inp type="number" label="Auto / e-rickshaw monthly (₹)" value={form.autoCost as string} onChange={(v) => upd("autoCost", v)} />
            <Inp type="number" label="Deposit (₹)" value={form.deposit as string} onChange={(v) => upd("deposit", v)} />
          </Section>

          {/* 4. Food & meals */}
          <Section title="4. Food & meals">
            <Sel label="Food arrangement" value={form.food as string} onChange={(v) => upd("food", v)} options={["Included", "Tiffin service", "Self-cooking", "None"]} />
            <Inp label="Breakfast timing" value={form.breakfast as string} onChange={(v) => upd("breakfast", v)} placeholder="e.g. 8–9 AM" />
            <Inp label="Breakfast menu" value={form.breakfastMenu as string} onChange={(v) => upd("breakfastMenu", v)} placeholder="e.g. Paratha, chai" />
            <Inp label="Lunch timing" value={form.lunch as string} onChange={(v) => upd("lunch", v)} placeholder="e.g. 1–2 PM" />
            <Inp label="Lunch menu" value={form.lunchMenu as string} onChange={(v) => upd("lunchMenu", v)} />
            <Inp label="Dinner timing" value={form.dinner as string} onChange={(v) => upd("dinner", v)} placeholder="e.g. 8–9 PM" />
            <Inp label="Dinner menu" value={form.dinnerMenu as string} onChange={(v) => upd("dinnerMenu", v)} />
          </Section>

          {/* 5. Utilities */}
          <Section title="5. Utilities">
            <Inp label="Electricity" value={form.electricity as string} onChange={(v) => upd("electricity", v)} placeholder="Included / ₹X extra" />
            <Inp label="Water charges" value={form.water as string} onChange={(v) => upd("water", v)} placeholder="Included / ₹X/mo" />
            <Inp label="Internet / WiFi" value={form.internet as string} onChange={(v) => upd("internet", v)} placeholder="Included / ₹X/mo" />
            <Inp label="Laundry / dhobi ₹/mo" value={form.laundry as string} onChange={(v) => upd("laundry", v)} />
          </Section>

          {/* 6. Facilities & security */}
          <Section title="6. Facilities & security">
            <Toggle label="AC available" value={!!form.ac} onChange={(v) => upd("ac", v)} />
            <Sel label="Rent negotiable" value={form.negotiable as string} onChange={(v) => upd("negotiable", v)} options={["Yes", "No", "Flexible"]} />
            <div className="sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Security features</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {SEC_OPTIONS.map((s) => {
                  const active = (form.security as string[]).includes(s);
                  return (
                    <button key={s} type="button" onClick={() => toggleSec(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${active ? "bg-brand-green text-white border-brand-green" : "bg-white text-foreground border-border"}`}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* 7. Nearby amenities */}
          <Section title="7. Nearby amenities">
            <Inp label="Gym name" value={form.gym as string} onChange={(v) => upd("gym", v)} placeholder="e.g. Gold's Gym" />
            <Inp label="Gym distance" value={form.gymDistance as string} onChange={(v) => upd("gymDistance", v)} placeholder="e.g. 5 min walk" />
            <Inp type="number" label="Gym fee ₹/mo" value={form.gymPrice as string} onChange={(v) => upd("gymPrice", v)} />
            <Inp label="Jogging / park" value={form.jogging as string} onChange={(v) => upd("jogging", v)} placeholder="e.g. Kamla Nehru Ridge" />
            <Inp label="Nearest market" value={form.market as string} onChange={(v) => upd("market", v)} placeholder="e.g. Kamla Nagar, 5 min" />
            <Inp label="Nearest hospital" value={form.hospital as string} onChange={(v) => upd("hospital", v)} />
            <Inp label="ATM nearby" value={form.atm as string} onChange={(v) => upd("atm", v)} />
            <Inp label="Pharmacy nearby" value={form.pharmacy as string} onChange={(v) => upd("pharmacy", v)} />
            <div className="sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Area description for students</span>
              <textarea value={form.areaDesc as string} onChange={(e) => upd("areaDesc", e.target.value)} rows={2}
                placeholder="Describe the locality — market, noise level, student crowd..."
                className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Photo URLs</span>
              <textarea value={form.photoUrls as string} onChange={(e) => upd("photoUrls", e.target.value)} rows={2}
                placeholder="Add image links separated by | or , — they appear in the listing gallery"
                className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </Section>

          {/* 8. Owner contact */}
          <Section title="8. Your contact">
            <Inp label="Your name *" value={form.ownerName as string} onChange={(v) => upd("ownerName", v)} />
            <Inp label="WhatsApp number *" value={form.whatsapp as string} onChange={(v) => upd("whatsapp", v)} />
            <div className="sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Additional info / special rules</span>
              <textarea value={form.notes as string} onChange={(e) => upd("notes", e.target.value)} rows={2}
                placeholder="Any rules, special features, availability date..."
                className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Known issues / problems (optional but appreciated)</span>
              <textarea value={form.knownIssues as string} onChange={(e) => upd("knownIssues", e.target.value)} rows={2}
                placeholder="e.g. Water pressure low in mornings, wifi slow sometimes, no parking..."
                className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </Section>

          <button type="submit" disabled={saving}
            className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-bold py-4 rounded-xl text-base disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? "Submitting…" : "Submit listing — it's free"}
          </button>
          <p className="text-xs text-center text-muted-foreground">
            By submitting you agree the information is accurate. Our team verifies every listing before publishing.
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

function Inp({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40" />
    </label>
  );
}

function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 bg-secondary border border-border rounded-lg px-3 py-2.5">
      <span className="text-sm font-medium">{label}</span>
      <button type="button" onClick={() => onChange(!value)}
        className={`relative w-10 h-6 rounded-full transition-colors ${value ? "bg-brand-green" : "bg-border"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${value ? "translate-x-4" : ""}`} />
      </button>
    </label>
  );
}
