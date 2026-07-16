import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, ArrowLeft, ArrowRight, Camera, X, Upload, Clock, CheckCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/list-your-property")({
  head: () => ({
    meta: [
      { title: "List your property — HomeWise" },
      { name: "description", content: "PG and flat owners: list on HomeWise and reach thousands of DU students. Free listing, verified within 24 hours." },
    ],
  }),
  component: ListYourPropertyPage,
});

const DU_COLLEGES = [
  "Miranda House", "Hindu College", "Hansraj College", "SRCC", "Kirori Mal College",
  "Lady Shri Ram College", "Daulat Ram College", "St. Stephens College", "Ramjas College",
  "Zakir Husain College", "Gargi College", "Jesus and Mary College", "Maitreyi College",
  "Kamala Nehru College", "LSR College", "Indraprastha College", "Sri Venkateswara College",
  "ARSD College", "Motilal Nehru College", "Deshbandhu College", "Shyam Lal College",
  "Maharaja Agrasen College", "Rajdhani College", "Kalindi College", "Bharati College",
  "SSCBS", "Lakshmibai College", "Aditi Mahavidyalaya", "Keshav Mahavidyalaya",
  "PGDAV College", "Shaheed Bhagat Singh College", "Swami Shraddhanand College",
  "Satyawati College", "Acharya Narendra Dev College", "Sri Aurobindo College",
  "Vivekananda College", "Shivaji College", "Ram Lal Anand College", "Other DU college",
];

const SECURITY_OPTIONS = [
  "📹 CCTV cameras on all floors",
  "👮 24×7 Security guard",
  "🔐 Biometric entry system",
  "📞 Intercom system",
  "🚪 Gated compound",
  "🧑‍💼 Resident warden",
];

type FormState = {
  // Step 1
  type: "pg" | "flat";
  name: string;
  address: string;
  locality: string;
  colleges: string[];
  collegeWalkTimes: Record<string, string>;
  gender: string;

  curfew: string;
  noCurfew: boolean;
  ac: string;
  available_from: string;
  // Step 2 PG
  has_single: boolean; price_single: string;
  has_double: boolean; price_double: string;
  has_triple: boolean; price_triple: string;
  // Step 2 Flat
  total_rent: string;
  flat_type: string;
  ideal_sharers: string;
  deposit: string;
  notice_period: string;
  negotiable: string;
  // Step 3
  food_type: string;
  breakfast_time: string; breakfast_menu: string;
  lunch_time: string; lunch_menu: string;
  dinner_time: string; dinner_menu: string;
  electricity: string; electricity_cost: string;
  water: string; water_cost: string;
  wifi: string; wifi_cost: string;
  laundry: string; laundry_cost: string;
  maid_available: boolean; maid_cost: string;
  cook_available: boolean; cook_cost: string;
  // Step 4
  walk_min: string;
  metro_station: string;
  metro_walk_min: string;
  metro_fare: string;
  auto_cost: string;
  security: string[];
  gym_name: string; gym_distance: string; gym_price: string;
  market: string; hospital: string; atm: string; pharmacy: string;
  jogging_spot: string;
  area_description: string;
  // Step 5
  owner_name: string;
  owner_whatsapp: string;
  owner_email: string;
  owner_alternate_phone: string;
  best_call_time: string;
  notes: string;
  terms: boolean;
  photos: string[];
  photoFiles: File[];
};

const initialForm: FormState = {
  type: "pg", name: "", address: "", locality: "",
  colleges: [], collegeWalkTimes: {},
  gender: "", curfew: "", noCurfew: false, ac: "", available_from: "",

  has_single: false, price_single: "",
  has_double: false, price_double: "",
  has_triple: false, price_triple: "",
  total_rent: "", flat_type: "", ideal_sharers: "", deposit: "", notice_period: "", negotiable: "",
  food_type: "",
  breakfast_time: "", breakfast_menu: "",
  lunch_time: "", lunch_menu: "",
  dinner_time: "", dinner_menu: "",
  electricity: "", electricity_cost: "",
  water: "", water_cost: "",
  wifi: "", wifi_cost: "",
  laundry: "", laundry_cost: "",
  maid_available: false, maid_cost: "",
  cook_available: false, cook_cost: "",
  walk_min: "", metro_station: "", metro_walk_min: "", metro_fare: "", auto_cost: "",
  security: [],
  gym_name: "", gym_distance: "", gym_price: "",
  market: "", hospital: "", atm: "", pharmacy: "",
  jogging_spot: "", area_description: "",
  owner_name: "", owner_whatsapp: "", owner_email: "", owner_alternate_phone: "",
  best_call_time: "", notes: "", terms: false,
  photos: [], photoFiles: [],
};

const toInt = (v: string): number | null => {
  if (!v) return null;
  const n = Number(String(v).replace(/[^0-9]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};

const STEP_LABELS = ["Property basics", "Pricing & rooms", "Food & expenses", "Location & amenities", "Your contact"];

function ListYourPropertyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState<null | { name: string; owner: string }>(null);

  const upd = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!form.name.trim()) return "Property name is required";
      if (!form.address.trim()) return "Property address is required";
      if (!form.locality.trim()) return "Locality is required";
      if (form.colleges.length === 0) return "Please select at least one college your property is near";
      if (!form.gender) return "Select a gender policy";
      if (!form.ac) return "Select AC availability";
      if (!form.available_from) return "Available from date is required";
    }
    if (s === 2) {
      if (form.type === "pg") {
        const anyRoom = form.has_single || form.has_double || form.has_triple;
        if (!anyRoom) return "Enable at least one room type";
        if (form.has_single && !toInt(form.price_single)) return "Single room price required";
        if (form.has_double && !toInt(form.price_double)) return "Double room price required";
        if (form.has_triple && !toInt(form.price_triple)) return "Triple room price required";
      } else {
        if (!toInt(form.total_rent)) return "Total rent required";
        if (!form.flat_type) return "Select flat type";
        if (!toInt(form.ideal_sharers)) return "Select ideal sharers";
      }
    }
    if (s === 3) {
      if (!form.food_type) return "Select a food arrangement";
      if (!form.electricity) return "Select electricity option";
      if (!form.water) return "Select water option";
      if (!form.wifi) return "Select WiFi option";
      if (!form.laundry) return "Select laundry option";
    }
    if (s === 4) {
      for (const c of form.colleges) {
        if (!toInt(form.collegeWalkTimes[c])) return `Walk time to ${c} required`;
      }

      if (!form.area_description.trim()) return "Area description required";
    }
    if (s === 5) {
      if (!form.owner_name.trim()) return "Your full name required";
      if (!/^\d{10}$/.test(form.owner_whatsapp.replace(/\D/g, ""))) return "Valid 10-digit WhatsApp number required";
      if (!/^\S+@\S+\.\S+$/.test(form.owner_email)) return "Valid email required";
      if (!form.best_call_time) return "Select best time to call";
      if (!form.terms) return "You must accept the terms to submit";
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep(step);
    if (err) { toast.error(err); return; }
    setStep((s) => Math.min(5, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    for (let s = 1; s <= 5; s++) {
      const err = validateStep(s);
      if (err) { setStep(s); toast.error(err); return; }
    }
    setSaving(true);
    try {
      const whatsappDigits = form.owner_whatsapp.replace(/\D/g, "");
      const payload: Record<string, unknown> = {
        status: "pending",
        type: form.type,
        name: form.name.trim(),
        address: form.address.trim(),
        locality: form.locality.trim(),
        college: form.college,
        gender: form.gender,
        curfew: form.noCurfew ? "None" : form.curfew,
        ac: form.ac,
        available_from: form.available_from,
        has_single: form.has_single,
        price_single: form.has_single ? toInt(form.price_single) : null,
        has_double: form.has_double,
        price_double: form.has_double ? toInt(form.price_double) : null,
        has_triple: form.has_triple,
        price_triple: form.has_triple ? toInt(form.price_triple) : null,
        total_rent: form.type === "flat" ? toInt(form.total_rent) : null,
        flat_type: form.type === "flat" ? form.flat_type : null,
        ideal_sharers: form.type === "flat" ? toInt(form.ideal_sharers) : null,
        per_person_2: form.type === "flat" && toInt(form.total_rent) ? Math.round(toInt(form.total_rent)! / 2) : null,
        per_person_3: form.type === "flat" && toInt(form.total_rent) ? Math.round(toInt(form.total_rent)! / 3) : null,
        per_person_4: form.type === "flat" && toInt(form.total_rent) ? Math.round(toInt(form.total_rent)! / 4) : null,
        deposit: toInt(form.deposit),
        notice_period: form.notice_period,
        negotiable: form.negotiable,
        food_type: form.food_type,
        breakfast_time: form.breakfast_time, breakfast_menu: form.breakfast_menu,
        lunch_time: form.lunch_time, lunch_menu: form.lunch_menu,
        dinner_time: form.dinner_time, dinner_menu: form.dinner_menu,
        electricity: form.electricity, electricity_cost: form.electricity_cost,
        water: form.water, water_cost: form.water_cost,
        wifi: form.wifi, wifi_cost: form.wifi_cost,
        laundry: form.laundry, laundry_cost: form.laundry_cost,
        maid_available: form.maid_available, maid_cost: form.maid_cost,
        cook_available: form.cook_available, cook_cost: form.cook_cost,
        walk_min: toInt(form.walk_min),
        metro_station: form.metro_station,
        metro_walk_min: toInt(form.metro_walk_min),
        metro_fare: toInt(form.metro_fare),
        auto_cost: toInt(form.auto_cost),
        security: form.security,
        security_score: form.security.length,
        gym_name: form.gym_name, gym_distance: form.gym_distance, gym_price: toInt(form.gym_price),
        market: form.market, hospital: form.hospital, atm: form.atm, pharmacy: form.pharmacy,
        jogging_spot: form.jogging_spot,
        area_description: form.area_description.slice(0, 300),
        owner_name: form.owner_name.trim(),
        owner_whatsapp: whatsappDigits,
        owner_email: form.owner_email.trim(),
        owner_alternate_phone: form.owner_alternate_phone.replace(/\D/g, "") || null,
      };
      // Insert listing first to get the ID
      const listingId = crypto.randomUUID();

      // Upload photos first so we can include URLs in the insert
      const uploadedUrls: string[] = [];
      for (const file of form.photoFiles) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `listings/${listingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("listing-photos").upload(path, file, { upsert: false });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("listing-photos").getPublicUrl(path);
          if (urlData?.publicUrl) uploadedUrls.push(urlData.publicUrl);
        }
      }

      const { error } = await supabase
        .from("listings")
        .insert({ ...payload, id: listingId, photos: uploadedUrls.length > 0 ? uploadedUrls : null } as never);
      if (error) {
        console.error("[submit] Supabase insert error:", error);
        const detail = [error.message, error.details, error.hint].filter(Boolean).join(" — ");
        toast.error(`Supabase: ${detail || "Unknown error"}`);
        return;
      }

      setSubmitted({ name: form.name, owner: form.owner_name });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("[submit] unexpected error:", err);
      toast.error(err instanceof Error ? `Could not submit: ${err.message}` : "Could not submit listing.");
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-navy flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(217,79,43,0.15)" }}>
            <CheckCircle2 size={44} className="text-brand-orange" />
          </div>
          <h1 className="font-tagline text-3xl text-brand-cream">Listing Submitted!</h1>
          <p className="mt-4 text-brand-cream/70">
            Thank you {submitted.owner}! We've received your listing for <span className="text-brand-cream font-semibold">{submitted.name}</span>.
            Our team will review it within 24 hours and contact you on WhatsApp if we need anything.
          </p>
          <div className="mt-6 bg-white rounded-2xl p-5 text-left space-y-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Submission summary</div>
            <div className="space-y-1 text-sm text-navy">
              <div><span className="text-muted-foreground">Property:</span> <b>{submitted.name}</b></div>
              <div><span className="text-muted-foreground">Type:</span> <b>{form.type === "pg" ? "PG" : "Flat"}</b></div>
              <div><span className="text-muted-foreground">Locality:</span> <b>{form.locality}</b></div>
              <div><span className="text-muted-foreground">College:</span> <b>{form.college}</b></div>
              <div><span className="text-muted-foreground">Status:</span> <span className="inline-flex items-center gap-1 font-bold" style={{ color: "#c9a84c" }}>🟡 Pending Review</span></div>
            </div>
            {/* Approval flow */}
            <div className="border-t border-border pt-4">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">What happens next?</div>
              <div className="space-y-2">
                <ApprovalStep icon={<CheckCheck size={14} />} color="#5a6b2a" label="Submitted" desc="Your listing is in our queue" done />
                <ApprovalStep icon={<Clock size={14} />} color="#c9a84c" label="Under Review" desc="Our team verifies details within 24 hrs" active />
                <ApprovalStep icon={<AlertCircle size={14} />} color="#1e5a8a" label="Verification Call" desc="We may WhatsApp you for photos or clarification" />
                <ApprovalStep icon={<CheckCircle2 size={14} />} color="#d94f2b" label="Goes Live" desc="Listing published — students can find you!" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => { setSubmitted(null); setForm(initialForm); setStep(1); }}
              className="flex-1 border border-brand-cream/30 text-brand-cream font-bold py-3 rounded-xl hover:bg-brand-cream/5"
            >
              Submit another listing
            </button>
            <button
              onClick={() => navigate({ to: "/listings" })}
              className="flex-1 bg-brand-orange hover:bg-brand-orange-dark text-white font-extrabold py-3 rounded-xl"
            >
              Browse listings →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy py-8 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-tagline text-2xl sm:text-3xl text-brand-cream">List your property</h1>
          <p className="text-brand-cream/60 mt-2 text-sm">Free · Verified · Reach thousands of DU students</p>
        </div>

        <ProgressBar step={step} />

        <div className="mt-8 bg-white rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
          <div className="h-1 bg-brand-orange" />
          <div className="p-6 sm:p-8">
            {step === 1 && <Step1 form={form} upd={upd} />}
            {step === 2 && <Step2 form={form} upd={upd} />}
            {step === 3 && <Step3 form={form} upd={upd} />}
            {step === 4 && <Step4 form={form} upd={upd} />}
            {step === 5 && <Step5 form={form} upd={upd} />}

            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
              {step > 1 && (
                <button onClick={goBack} className="flex items-center gap-2 border border-border text-navy font-semibold px-5 py-3 rounded-xl hover:bg-secondary">
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              {step < 5 && (
                <button onClick={goNext} className="ml-auto flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-extrabold px-6 py-3 rounded-xl">
                  Next: {STEP_LABELS[step]} <ArrowRight size={16} />
                </button>
              )}
              {step === 5 && (
                <button
                  onClick={submit}
                  disabled={saving || !form.terms}
                  className="ml-auto bg-brand-orange hover:bg-brand-orange-dark text-white font-extrabold px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Submitting…" : "Submit Listing for Review ✅"}
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-brand-cream/40 text-xs mt-6">
          Already have a listing? <Link to="/listings" className="text-brand-orange hover:underline">Browse listings</Link>
        </p>
      </div>
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={n} className="flex-1 flex items-center gap-1 sm:gap-2">
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0"
                style={{
                  backgroundColor: done ? "#5a6b2a" : active ? "#d94f2b" : "transparent",
                  color: done || active ? "white" : "#e8dcc8",
                  border: !done && !active ? "2px solid rgba(232,220,200,0.3)" : "none",
                }}
              >
                {done ? "✓" : n}
              </div>
              <div className={`text-[9px] sm:text-xs text-center leading-tight ${active ? "text-brand-cream font-bold" : "text-brand-cream/50"} hidden sm:block truncate max-w-[80px]`}>{label}</div>
            </div>
            {n < 5 && (
              <div className="flex-1 h-0.5 rounded" style={{ backgroundColor: n < step ? "#d94f2b" : "rgba(232,220,200,0.2)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------ Step 1 ------------ */
function Step1({ form, upd }: { form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Tell us about your property" />

      <Field label="What are you listing? *">
        <div className="grid grid-cols-2 gap-3">
          <TypeCard active={form.type === "pg"} onClick={() => upd("type", "pg")} icon="🏠" title="PG / Paying Guest" subtitle="Meals, managed, structured" />
          <TypeCard active={form.type === "flat"} onClick={() => upd("type", "flat")} icon="🏢" title="Flat / Apartment" subtitle="Students share rent" />
        </div>
      </Field>

      <Field label="Property name *"><TextInput value={form.name} onChange={(v) => upd("name", v)} placeholder="e.g. Sharma PG for Girls" /></Field>
      <Field label="Property address *"><TextInput value={form.address} onChange={(v) => upd("address", v)} placeholder="Full address with lane/street" /></Field>
      <Field label="Locality / Area *"><TextInput value={form.locality} onChange={(v) => upd("locality", v)} placeholder="e.g. Kamla Nagar, Hudson Lane" /></Field>

      <Field label="Nearest DU college *">
        <select value={form.college} onChange={(e) => upd("college", e.target.value)} className={inputCls}>
          {DU_COLLEGES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>

      <Field label="Gender policy *">
        <div className="flex flex-wrap gap-2">
          {[{ v: "girls", l: "👩 Girls only" }, { v: "boys", l: "👨 Boys only" }, { v: "coed", l: "🤝 Co-ed" }].map((o) => (
            <Chip key={o.v} active={form.gender === o.v} onClick={() => upd("gender", o.v)}>{o.l}</Chip>
          ))}
        </div>
      </Field>

      <Field label="Curfew timing">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <TextInput value={form.curfew} onChange={(v) => upd("curfew", v)} placeholder="e.g. 10:30 PM" disabled={form.noCurfew} />
          <label className="flex items-center gap-2 text-sm text-navy shrink-0">
            <input type="checkbox" checked={form.noCurfew} onChange={(e) => upd("noCurfew", e.target.checked)} /> No curfew
          </label>
        </div>
      </Field>

      <Field label="AC available? *">
        <div className="flex gap-2">
          {[{ v: "yes", l: "Yes — AC rooms" }, { v: "no", l: "No AC" }].map((o) => (
            <Chip key={o.v} active={form.ac === o.v} onClick={() => upd("ac", o.v)}>{o.l}</Chip>
          ))}
        </div>
      </Field>

      <Field label="Available from *">
        <input type="date" value={form.available_from} onChange={(e) => upd("available_from", e.target.value)} className={inputCls} />
      </Field>
    </div>
  );
}

/* ------------ Step 2 ------------ */
function Step2({ form, upd }: { form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  const isPG = form.type === "pg";
  const total = toInt(form.total_rent);
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle title={isPG ? "Set your room types and prices" : "Flat pricing"} />
        <p className="text-sm text-muted-foreground mt-1">{isPG ? "Students will see all options side by side" : "Total rent and share preview"}</p>
      </div>

      {isPG && (
        <>
          <RoomToggle icon="👤" title="Single Room" hint="1 student per room" enabled={form.has_single} price={form.price_single} onToggle={(v) => upd("has_single", v)} onPrice={(v) => upd("price_single", v)} perLabel="Price per month" />
          <RoomToggle icon="👥" title="Double Sharing" hint="2 students share one room" enabled={form.has_double} price={form.price_double} onToggle={(v) => upd("has_double", v)} onPrice={(v) => upd("price_double", v)} perLabel="Price per person / month" />
          <RoomToggle icon="👥👥" title="Triple Sharing" hint="3 students share one room" enabled={form.has_triple} price={form.price_triple} onToggle={(v) => upd("has_triple", v)} onPrice={(v) => upd("price_triple", v)} perLabel="Price per person / month" />

          <div className="rounded-lg p-4 text-sm text-navy" style={{ backgroundColor: "#f8f4ee", borderLeft: "3px solid #d94f2b" }}>
            💡 <b>Tip:</b> Offering multiple room types gets 3× more enquiries. Students compare options and choose what fits their budget.
          </div>
        </>
      )}

      {!isPG && (
        <>
          <Field label="Total monthly rent (₹) *"><TextInput type="number" value={form.total_rent} onChange={(v) => upd("total_rent", v)} placeholder="Total for entire flat" /></Field>
          <Field label="Flat type *">
            <div className="flex flex-wrap gap-2">
              {["1BHK", "2BHK", "3BHK", "4BHK"].map((f) => (
                <Chip key={f} active={form.flat_type === f} onClick={() => upd("flat_type", f)}>{f}</Chip>
              ))}
            </div>
          </Field>
          <Field label="Ideal number of sharers *">
            <div className="flex flex-wrap gap-2">
              {["2", "3", "4"].map((n) => (
                <Chip key={n} active={form.ideal_sharers === n} onClick={() => upd("ideal_sharers", n)}>{n} people</Chip>
              ))}
            </div>
          </Field>
          {total && (
            <div className="rounded-xl p-4 text-brand-cream" style={{ backgroundColor: "#0a1628" }}>
              <div className="text-xs uppercase tracking-widest text-brand-cream/60 font-bold">Per person cost</div>
              <div className="mt-2 space-y-1 text-sm">
                <div>2 people: <b className="text-brand-orange">₹{Math.round(total / 2).toLocaleString("en-IN")}</b> each</div>
                <div>3 people: <b className="text-brand-orange">₹{Math.round(total / 3).toLocaleString("en-IN")}</b> each ✅ Recommended</div>
                <div>4 people: <b className="text-brand-orange">₹{Math.round(total / 4).toLocaleString("en-IN")}</b> each</div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Deposit amount (₹)"><TextInput type="number" value={form.deposit} onChange={(v) => upd("deposit", v)} /></Field>
        <Field label="Notice period"><TextInput value={form.notice_period} onChange={(v) => upd("notice_period", v)} placeholder="e.g. 1 month" /></Field>
      </div>

      <Field label="Is rent negotiable?">
        <div className="flex flex-wrap gap-2">
          {[{ v: "yes", l: "Yes — open to discuss" }, { v: "no", l: "No — fixed price" }, { v: "flexible", l: "Flexible on deposit" }].map((o) => (
            <Chip key={o.v} active={form.negotiable === o.v} onClick={() => upd("negotiable", o.v)}>{o.l}</Chip>
          ))}
        </div>
      </Field>
    </div>
  );
}

function RoomToggle({ icon, title, hint, enabled, price, onToggle, onPrice, perLabel }: {
  icon: string; title: string; hint: string; enabled: boolean; price: string;
  onToggle: (v: boolean) => void; onPrice: (v: string) => void; perLabel: string;
}) {
  return (
    <div className={`border rounded-xl p-4 ${enabled ? "border-brand-orange bg-[#fff3ee]" : "border-border"}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold text-navy">{icon} {title}</div>
          <div className="text-xs text-muted-foreground">{hint}</div>
        </div>
        <button
          type="button"
          onClick={() => onToggle(!enabled)}
          className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? "bg-brand-orange" : "bg-gray-300"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : ""}`} />
        </button>
      </div>
      {enabled && (
        <div className="mt-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{perLabel}</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-navy font-bold">₹</span>
            <input type="number" value={price} onChange={(e) => onPrice(e.target.value)} className={inputCls + " flex-1"} placeholder="0" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------ Step 3 ------------ */
function Step3({ form, upd }: { form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  const foodShown = form.food_type === "included" || form.food_type === "tiffin";
  return (
    <div className="space-y-6">
      <SectionTitle title="Food arrangement" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { v: "included", i: "✅", t: "Included in rent", d: "3 meals daily" },
          { v: "tiffin", i: "🥡", t: "Tiffin service", d: "Available on request" },
          { v: "self", i: "🍳", t: "Self cooking", d: "Kitchen access" },
          { v: "none", i: "❌", t: "No food arrangement", d: "" },
        ].map((o) => (
          <OptionCard key={o.v} active={form.food_type === o.v} onClick={() => upd("food_type", o.v)} icon={o.i} title={o.t} subtitle={o.d} />
        ))}
      </div>

      {foodShown && (
        <div className="space-y-4 rounded-xl p-4" style={{ backgroundColor: "#f8f4ee" }}>
          <div className="text-sm font-bold text-navy">Meal schedule</div>
          {[
            { l: "Breakfast", tKey: "breakfast_time" as const, mKey: "breakfast_menu" as const },
            { l: "Lunch", tKey: "lunch_time" as const, mKey: "lunch_menu" as const },
            { l: "Dinner", tKey: "dinner_time" as const, mKey: "dinner_menu" as const },
          ].map((m) => (
            <div key={m.l} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label={`${m.l} time`}><TextInput value={form[m.tKey]} onChange={(v) => upd(m.tKey, v)} placeholder="e.g. 7:00 AM - 9:00 AM" /></Field>
              <Field label={`${m.l} menu`}><TextInput value={form[m.mKey]} onChange={(v) => upd(m.mKey, v)} placeholder="e.g. Paratha, egg, chai" /></Field>
            </div>
          ))}
        </div>
      )}

      <SectionTitle title="Monthly expenses" subtitle="Be honest — students check this" />

      <ExpenseRow label="Electricity *" value={form.electricity} cost={form.electricity_cost} onValue={(v) => upd("electricity", v)} onCost={(v) => upd("electricity_cost", v)} options={[["included", "✅ Included in rent"], ["extra", "⚡ Tenant pays"]]} costHint="/month" />
      <ExpenseRow label="Water charges *" value={form.water} cost={form.water_cost} onValue={(v) => upd("water", v)} onCost={(v) => upd("water_cost", v)} options={[["included", "✅ Included"], ["extra", "💧 ₹100-200/month"]]} costHint="/month" />
      <ExpenseRow label="WiFi / Internet *" value={form.wifi} cost={form.wifi_cost} onValue={(v) => upd("wifi", v)} onCost={(v) => upd("wifi_cost", v)} options={[["included", "✅ Included"], ["shared", "📶 Shared cost"], ["none", "❌ Not available"]]} costHint="/month" />
      <ExpenseRow label="Laundry *" value={form.laundry} cost={form.laundry_cost} onValue={(v) => upd("laundry", v)} onCost={(v) => upd("laundry_cost", v)} options={[["included", "✅ Included"], ["dhobi", "🧺 Dhobi nearby"], ["none", "❌ Not available"]]} costHint="/month" />

      {form.type === "flat" && (
        <>
          <ExpenseRow label="Maid available?" value={form.maid_available ? "yes" : "no"} cost={form.maid_cost} onValue={(v) => upd("maid_available", v === "yes")} onCost={(v) => upd("maid_cost", v)} options={[["yes", "Yes — shared"], ["no", "No"]]} costHint="/month shared" />
          <ExpenseRow label="Cook available?" value={form.cook_available ? "yes" : "no"} cost={form.cook_cost} onValue={(v) => upd("cook_available", v === "yes")} onCost={(v) => upd("cook_cost", v)} options={[["yes", "Yes — shared"], ["no", "No"]]} costHint="/month shared" />
        </>
      )}
    </div>
  );
}

function ExpenseRow({ label, value, cost, onValue, onCost, options, costHint }: {
  label: string; value: string; cost: string; onValue: (v: string) => void; onCost: (v: string) => void;
  options: [string, string][]; costHint: string;
}) {
  const showCost = value && value !== "included" && value !== "no" && value !== "none";
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, l]) => <Chip key={v} active={value === v} onClick={() => onValue(v)}>{l}</Chip>)}
      </div>
      {showCost && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-navy font-bold">₹</span>
          <input type="number" value={cost} onChange={(e) => onCost(e.target.value)} placeholder="0" className={inputCls + " flex-1"} />
          <span className="text-xs text-muted-foreground">{costHint}</span>
        </div>
      )}
    </div>
  );
}

/* ------------ Step 4 ------------ */
function Step4({ form, upd }: { form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  const walk = toInt(form.walk_min);
  const walkLabel = !walk ? "" : walk <= 15 ? "🟢 Great location" : walk <= 25 ? "🟡 Good location" : "🔴 Far from college";
  const secScore = form.security.length;
  const toggleSec = (opt: string) => {
    const next = form.security.includes(opt) ? form.security.filter((s) => s !== opt) : [...form.security, opt];
    upd("security", next);
  };
  return (
    <div className="space-y-6">
      <SectionTitle title="Location" />
      <Field label="Walk time to college gate *">
        <div className="flex items-center gap-3">
          <input type="number" value={form.walk_min} onChange={(e) => upd("walk_min", e.target.value)} className={inputCls + " max-w-[120px]"} />
          <span className="text-navy text-sm">minutes</span>
          {walkLabel && <span className="text-sm font-bold">{walkLabel}</span>}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Actual walking minutes, not driving. Students verify this.</p>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nearest metro station"><TextInput value={form.metro_station} onChange={(v) => upd("metro_station", v)} placeholder="e.g. Vishwavidyalaya" /></Field>
        <Field label="Walk time to metro (min)"><TextInput type="number" value={form.metro_walk_min} onChange={(v) => upd("metro_walk_min", v)} /></Field>
        <Field label="Monthly metro pass cost (₹)"><TextInput type="number" value={form.metro_fare} onChange={(v) => upd("metro_fare", v)} placeholder="e.g. 650" /></Field>
        <Field label="Auto/rickshaw estimate (₹/month)"><TextInput type="number" value={form.auto_cost} onChange={(v) => upd("auto_cost", v)} placeholder="0 if walking" /></Field>
      </div>

      <SectionTitle title="Security features" subtitle="Select all that apply" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SECURITY_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggleSec(opt)}
            className={`text-left px-4 py-3 rounded-xl border text-sm transition-colors ${form.security.includes(opt) ? "border-brand-orange bg-[#fff3ee] text-navy font-semibold" : "border-border text-navy hover:border-brand-orange/40"}`}
          >
            {form.security.includes(opt) ? "☑ " : "☐ "} {opt}
          </button>
        ))}
      </div>
      <div className="text-sm text-navy">Your security score: <b>{secScore}/6</b> {secScore >= 4 && "⭐"}</div>

      <SectionTitle title="Nearby amenities" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nearby gym name"><TextInput value={form.gym_name} onChange={(v) => upd("gym_name", v)} /></Field>
        <Field label="Gym distance"><TextInput value={form.gym_distance} onChange={(v) => upd("gym_distance", v)} placeholder="e.g. 300m" /></Field>
        <Field label="Gym monthly fee (₹)"><TextInput type="number" value={form.gym_price} onChange={(v) => upd("gym_price", v)} /></Field>
        <Field label="Nearest market"><TextInput value={form.market} onChange={(v) => upd("market", v)} placeholder="e.g. Kamla Nagar - 2 min" /></Field>
        <Field label="Nearest hospital"><TextInput value={form.hospital} onChange={(v) => upd("hospital", v)} placeholder="e.g. Hindu Rao - 10 min" /></Field>
        <Field label="Nearest ATM"><TextInput value={form.atm} onChange={(v) => upd("atm", v)} placeholder="e.g. SBI ATM - 3 min" /></Field>
        <Field label="Nearest pharmacy"><TextInput value={form.pharmacy} onChange={(v) => upd("pharmacy", v)} /></Field>
        <Field label="Morning jogging spot"><TextInput value={form.jogging_spot} onChange={(v) => upd("jogging_spot", v)} placeholder="e.g. Kamla Nagar Park" /></Field>
      </div>

      <Field label="Area description *">
        <textarea
          value={form.area_description}
          onChange={(e) => upd("area_description", e.target.value.slice(0, 300))}
          rows={4}
          className={inputCls}
          placeholder="Describe what it's like living here — safety, vibe, food options, ease of getting autos…"
        />
        <div className="text-xs text-muted-foreground mt-1">{form.area_description.length}/300</div>
      </Field>
    </div>
  );
}

/* ------------ Step 5 ------------ */
function Step5({ form, upd }: { form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle title="How will students reach you?" />

      <Field label="Your full name *"><TextInput value={form.owner_name} onChange={(v) => upd("owner_name", v)} /></Field>
      <Field label="WhatsApp number *">
        <TextInput type="tel" value={form.owner_whatsapp} onChange={(v) => upd("owner_whatsapp", v.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit number" />
        <p className="text-xs text-muted-foreground mt-1">Students will contact you directly on WhatsApp.</p>
      </Field>
      <Field label="Email address *"><TextInput type="email" value={form.owner_email} onChange={(v) => upd("owner_email", v)} /></Field>
      <Field label="Alternate phone (optional)"><TextInput type="tel" value={form.owner_alternate_phone} onChange={(v) => upd("owner_alternate_phone", v.replace(/\D/g, "").slice(0, 10))} /></Field>

      <Field label="Best time to call *">
        <div className="flex flex-wrap gap-2">
          {["Morning 9AM-12PM", "Afternoon 12-4PM", "Evening 4-8PM", "Anytime"].map((o) => (
            <Chip key={o} active={form.best_call_time === o} onClick={() => upd("best_call_time", o)}>{o}</Chip>
          ))}
        </div>
      </Field>

      <Field label="Special rules or notes">
        <textarea
          value={form.notes}
          onChange={(e) => upd("notes", e.target.value)}
          rows={3}
          className={inputCls}
          placeholder="Any important rules students should know — e.g. No non-veg, Visitors till 8 PM…"
        />
      </Field>

      <PhotoUpload photos={form.photos} photoFiles={form.photoFiles} onUpdate={(photos, photoFiles) => { upd("photos", photos); upd("photoFiles", photoFiles); }} />

      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={form.terms} onChange={(e) => upd("terms", e.target.checked)} className="mt-1" />
        <span className="text-sm text-navy">
          I confirm all information provided is accurate and I agree to DU Nest{" "}
          <a href="/terms" target="_blank" className="text-brand-orange underline">Terms &amp; Conditions</a>.
          I understand fake or misleading listings will be permanently removed.
        </span>
      </label>
    </div>
  );
}

function PhotoUpload({ photos, photoFiles, onUpdate }: {
  photos: string[];
  photoFiles: File[];
  onUpdate: (photos: string[], photoFiles: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 10 - photoFiles.length);
    if (newFiles.length === 0) return;
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    onUpdate([...photos, ...newPreviews], [...photoFiles, ...newFiles]);
  };

  const remove = (i: number) => {
    const newPhotos = photos.filter((_, idx) => idx !== i);
    const newFiles = photoFiles.filter((_, idx) => idx !== i);
    onUpdate(newPhotos, newFiles);
  };

  return (
    <div className="space-y-3">
      <SectionTitle title="Property Photos" subtitle="Upload up to 10 photos — more photos = more enquiries" />
      <div className="grid grid-cols-3 gap-2">
        {photos.map((src, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
            <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {photos.length < 10 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-brand-orange/40 flex flex-col items-center justify-center gap-1 hover:border-brand-orange hover:bg-[#fff3ee] transition-colors"
          >
            <Upload size={20} className="text-brand-orange" />
            <span className="text-[10px] font-bold text-brand-orange">Add Photo</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-xs text-muted-foreground">JPG, PNG, WEBP · Max 5MB each · First photo will be the cover image</p>
    </div>
  );
}

/* ------------ Shared UI ------------ */
const inputCls = "w-full bg-white border border-border rounded-lg px-3 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition-colors disabled:opacity-50";

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="font-tagline text-xl text-navy" style={{ fontWeight: 700 }}>{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean;
}) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className={inputCls} />;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${active ? "bg-brand-orange border-brand-orange text-white" : "bg-white border-border text-navy hover:border-brand-orange/40"}`}
    >
      {children}
    </button>
  );
}

function TypeCard({ active, onClick, icon, title, subtitle }: { active: boolean; onClick: () => void; icon: string; title: string; subtitle: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-5 rounded-xl border-2 text-center transition-all ${active ? "border-brand-orange bg-[#fff3ee]" : "border-border bg-white hover:border-brand-orange/40"}`}
    >
      <div className="text-3xl">{icon}</div>
      <div className="mt-2 font-bold text-navy">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
    </button>
  );
}

function OptionCard({ active, onClick, icon, title, subtitle }: { active: boolean; onClick: () => void; icon: string; title: string; subtitle: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-xl border-2 text-left transition-all ${active ? "border-brand-orange bg-[#fff3ee]" : "border-border bg-white hover:border-brand-orange/40"}`}
    >
      <div className="text-xl">{icon}</div>
      <div className="mt-1 font-bold text-navy text-sm">{title}</div>
      {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
    </button>
  );
}

function ApprovalStep({ icon, color, label, desc, done, active }: {
  icon: React.ReactNode; color: string; label: string; desc: string; done?: boolean; active?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: done || active ? color : "#e2ddd6" }}>
        {icon}
      </div>
      <div>
        <div className={`text-sm font-bold ${done || active ? "text-navy" : "text-muted-foreground"}`}>{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

