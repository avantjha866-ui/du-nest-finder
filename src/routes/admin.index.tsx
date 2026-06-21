import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { COLLEGES } from "@/lib/data";
import { directSupabase } from "@/lib/directSupabase";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Admin — DUNest" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminFormPage,
});

const initialListingForm: Record<string, unknown> = {
  type: "PG",
  name: "",
  locality: "",
  college: COLLEGES[0],
  rent: "",
  walk: "",
  gender: "Co-ed",
  curfew: "",
  room: "Double",
  metroStation: "",
  metroWalk: "",
  deposit: "",
  metroPass: 650,
  autoCost: "",
  food: "Included",
  breakfast: "",
  lunch: "",
  dinner: "",
  weeklyOff: "",
  electricity: "Included",
  water: "Included",
  laundry: "",
  internet: "Included",
  otherCharges: "",
  security: [] as string[],
  ac: false,
  geyser: false,
  parking: false,
  negotiable: "Yes",
  gym: "",
  jogging: "",
  market: "",
  hospital: "",
  atm: "",
  pharmacy: "",
  laundryShop: "",
  bhk: "2BHK",
  sharers: 3,
  maid: "",
  cook: "",
  flatmates: "",
  ownerName: "",
  whatsapp: "",
  altContact: "",
  notes: "",
};

const optionalInteger = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

function AdminFormPage() {
  const { logout } = useAdminAuth();
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>(() => ({ ...initialListingForm }));

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
            It will be live after review.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-5 bg-brand-green hover:bg-brand-green-dark text-white font-semibold px-6 py-3 rounded-xl"
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy-soft min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">Add a new listing</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Submit a property for verification and review.
            </p>
          </div>
          <button onClick={logout} className="text-xs text-muted-foreground underline">
            Sign out
          </button>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (saving) return;
            const missing: string[] = [];
            if (!form.name) missing.push("property name");
            if (!form.rent) missing.push("rent");
            if (!form.ownerName) missing.push("owner name");
            if (!form.whatsapp) missing.push("WhatsApp number");
            if (missing.length) {
              toast.error(`Please fill: ${missing.join(", ")}`);
              return;
            }
            setSaving(true);
            try {
              const { error } = await directSupabase.from("listings").insert({
                status: "pending",
                type: String(form.type).toLowerCase(),
                name: String(form.name),
                locality: String(form.locality || ""),
                college: String(form.college || ""),
                rent: optionalInteger(form.rent),
                walk_min: optionalInteger(form.walk),
                gender: String(form.gender || ""),
                curfew: String(form.curfew || ""),
                ac: form.ac ? "Yes" : "No",
                metro_station: String(form.metroStation || ""),
                metro_walk_min: optionalInteger(form.metroWalk),
                food_type: String(form.food || ""),
                wifi: String(form.internet || ""),
                sharers: form.type === "Flat" ? optionalInteger(form.sharers) : null,
                deposit: optionalInteger(form.deposit),
                owner_name: String(form.ownerName),
                whatsapp: String(form.whatsapp),
                notes: String(form.notes || ""),
              });
              if (error) throw error;
              setForm({ ...initialListingForm, security: [] });
              setSubmitted(true);
              toast.success("Listing submitted! It will be live after review.");
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
          <Section title="1. Basic info">
            <Sel label="Listing type" value={form.type as string} onChange={(v) => upd("type", v)} options={["PG", "Flat"]} />
            <Inp label="Property name" value={form.name as string} onChange={(v) => upd("name", v)} />
            <Inp label="Locality / area" value={form.locality as string} onChange={(v) => upd("locality", v)} />
            <Sel label="Nearest DU college" value={form.college as string} onChange={(v) => upd("college", v)} options={[...COLLEGES]} />
            <Inp type="number" label="Monthly rent (₹)" value={form.rent as string} onChange={(v) => upd("rent", v)} />
            <Inp type="number" label="Walk to college (min)" value={form.walk as string} onChange={(v) => upd("walk", v)} />
            <Sel label="Gender policy" value={form.gender as string} onChange={(v) => upd("gender", v)} options={["Girls only", "Boys only", "Co-ed"]} />
            <Inp label="Curfew (or 'None')" value={form.curfew as string} onChange={(v) => upd("curfew", v)} />
            <Sel label="Room type" value={form.room as string} onChange={(v) => upd("room", v)} options={["Single", "Double", "Triple", "Full flat"]} />
          </Section>

          <Section title="2. Transport">
            <Inp label="Nearest metro station" value={form.metroStation as string} onChange={(v) => upd("metroStation", v)} />
            <Inp type="number" label="Walk to metro (min)" value={form.metroWalk as string} onChange={(v) => upd("metroWalk", v)} />
            <Inp type="number" label="Deposit (₹)" value={form.deposit as string} onChange={(v) => upd("deposit", v)} />
            <Inp type="number" label="Monthly metro pass (₹)" value={form.metroPass as string} onChange={(v) => upd("metroPass", v)} />
            <Inp type="number" label="Auto / rickshaw monthly (₹)" value={form.autoCost as string} onChange={(v) => upd("autoCost", v)} />
          </Section>

          <Section title="3. Food & meals">
            <Sel label="Food arrangement" value={form.food as string} onChange={(v) => upd("food", v)} options={["Included", "Tiffin service", "Self-cooking", "None"]} />
            <Inp label="Breakfast timing + menu" value={form.breakfast as string} onChange={(v) => upd("breakfast", v)} />
            <Inp label="Lunch timing + menu" value={form.lunch as string} onChange={(v) => upd("lunch", v)} />
            <Inp label="Dinner timing + menu" value={form.dinner as string} onChange={(v) => upd("dinner", v)} />
            <Inp label="Weekly off day for meals" value={form.weeklyOff as string} onChange={(v) => upd("weeklyOff", v)} />
          </Section>

          <Section title="4. Monthly expenses">
            <Inp label="Electricity (Included or ₹X extra)" value={form.electricity as string} onChange={(v) => upd("electricity", v)} />
            <Inp label="Water charges" value={form.water as string} onChange={(v) => upd("water", v)} />
            <Inp label="Laundry / dhobi" value={form.laundry as string} onChange={(v) => upd("laundry", v)} />
            <Inp label="Internet / WiFi" value={form.internet as string} onChange={(v) => upd("internet", v)} />
            <Inp label="Other monthly charges" value={form.otherCharges as string} onChange={(v) => upd("otherCharges", v)} />
          </Section>

          <Section title="5. Security & facilities">
            <div className="sm:col-span-2">
              <Label>Security features</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {["24x7 Guard", "CCTV all floors", "Biometric entry", "Intercom", "Gated compound"].map((s) => {
                  const active = (form.security as string[]).includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSec(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium ${
                        active
                          ? "bg-brand-green text-white border-brand-green"
                          : "bg-white text-foreground border-border"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <Toggle label="AC available" value={!!form.ac} onChange={(v) => upd("ac", v)} />
            <Toggle label="Geyser" value={!!form.geyser} onChange={(v) => upd("geyser", v)} />
            <Toggle label="Parking" value={!!form.parking} onChange={(v) => upd("parking", v)} />
            <Sel label="Rent negotiable" value={form.negotiable as string} onChange={(v) => upd("negotiable", v)} options={["Yes", "No", "Flexible"]} />
          </Section>

          <Section title="6. Nearby services">
            <Inp label="Gym (name + distance + ₹/mo)" value={form.gym as string} onChange={(v) => upd("gym", v)} />
            <Inp label="Morning jogging spot / park" value={form.jogging as string} onChange={(v) => upd("jogging", v)} />
            <Inp label="Nearest market + walk time" value={form.market as string} onChange={(v) => upd("market", v)} />
            <Inp label="Nearest hospital + distance" value={form.hospital as string} onChange={(v) => upd("hospital", v)} />
            <Inp label="ATM + bank + walk time" value={form.atm as string} onChange={(v) => upd("atm", v)} />
            <Inp label="Pharmacy + walk time" value={form.pharmacy as string} onChange={(v) => upd("pharmacy", v)} />
            <Inp label="Laundry / dhobi + walk time" value={form.laundryShop as string} onChange={(v) => upd("laundryShop", v)} />
          </Section>

          {form.type === "Flat" && (
            <Section title="7. Flat specific">
              <Sel label="Flat type" value={form.bhk as string} onChange={(v) => upd("bhk", v)} options={["1BHK", "2BHK", "3BHK"]} />
              <Sel label="Ideal sharers" value={String(form.sharers)} onChange={(v) => upd("sharers", Number(v))} options={["2", "3", "4"]} />
              <Inp label="Maid monthly cost (₹)" value={form.maid as string} onChange={(v) => upd("maid", v)} />
              <Inp label="Cook monthly cost (₹)" value={form.cook as string} onChange={(v) => upd("cook", v)} />
              <Inp label="Already-interested flatmates (names + year)" value={form.flatmates as string} onChange={(v) => upd("flatmates", v)} />
            </Section>
          )}

          <Section title="8. Owner contact">
            <Inp label="Owner name" value={form.ownerName as string} onChange={(v) => upd("ownerName", v)} />
            <Inp label="WhatsApp number" value={form.whatsapp as string} onChange={(v) => upd("whatsapp", v)} />
            <Inp label="Alternate contact" value={form.altContact as string} onChange={(v) => upd("altContact", v)} />
            <div className="sm:col-span-2">
              <Label>Additional notes / special rules</Label>
              <textarea
                value={form.notes as string}
                onChange={(e) => upd("notes", e.target.value)}
                rows={3}
                className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </Section>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-bold py-4 rounded-xl text-base disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Submitting…" : "Submit listing for review"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="bg-white border border-border rounded-2xl p-5 sm:p-6">
      <legend className="px-2 text-sm font-bold uppercase tracking-wider text-brand-green-dark">
        {title}
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">{children}</div>
    </fieldset>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}

function Inp({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40"
      />
    </label>
  );
}

function Sel({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 bg-secondary border border-border rounded-lg px-3 py-2.5">
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          value ? "bg-brand-green" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            value ? "translate-x-4" : ""
          }`}
        />
      </button>
    </label>
  );
}
