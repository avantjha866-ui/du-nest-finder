import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  MapPin, Share2, Users, User, Utensils, Train, Zap, ShieldCheck, Clock,
  Home as HomeIcon, Building2, Camera, X, ChevronLeft, ChevronRight,
  Dumbbell, ShoppingCart, Hospital, CreditCard, Pill, Trees,
} from "lucide-react";
import { getListingById } from "@/lib/listing-detail.functions";
import type { DirectListingRow } from "@/lib/directSupabase";
import { toast } from "sonner";

const detailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["listing", id],
    queryFn: () => getListingById({ data: { id } }),
    staleTime: 5 * 60 * 1000,
  });

function DetailError({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-navy text-brand-cream flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h2 className="font-tagline text-2xl">Could not load listing.</h2>
        <p className="mt-2 text-brand-cream/70">{error.message}</p>
        <Link to="/listings" className="mt-6 inline-block bg-brand-orange text-white font-bold px-6 py-3 rounded-xl">
          Back to listings
        </Link>
      </div>
    </div>
  );
}

function DetailNotFound() {
  return (
    <div className="min-h-screen bg-navy text-brand-cream flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h2 className="font-tagline text-2xl">Listing not found</h2>
        <p className="mt-2 text-brand-cream/70">This property may have been removed or is no longer available.</p>
        <Link to="/listings" className="mt-6 inline-block bg-brand-orange text-white font-bold px-6 py-3 rounded-xl">
          Browse all listings
        </Link>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/listings/$id")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(detailQueryOptions(params.id));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — HomeWise` : "Listing — HomeWise" },
      { name: "description", content: loaderData ? `${loaderData.name} in ${loaderData.locality}, near ${loaderData.college}.` : "Verified student housing near DU." },
      { property: "og:title", content: loaderData?.name ?? "HomeWise Listing" },
    ],
  }),
  errorComponent: DetailError,
  notFoundComponent: DetailNotFound,
  component: ListingDetail,
});

const boolish = (v: string | null) => ["yes", "true", "included", "available"].includes((v ?? "").toLowerCase());

type RoomOption = { key: string; label: string; per: string; price: number; note?: string; icon: string };

function ListingDetail() {
  const { id } = Route.useParams();
  const { data: l } = useSuspenseQuery(detailQueryOptions(id));
  if (!l) return null;

  const isFlat = (l.type ?? "").toLowerCase() === "flat";
  const photos = l.photos ?? [];
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  const roomOptions: RoomOption[] = useMemo(() => {
    if (isFlat) {
      const total = l.total_rent ?? 0;
      const opts: RoomOption[] = [];
      opts.push({ key: "solo", label: "Solo", per: "you alone", price: total, note: "Not recommended", icon: "👤" });
      if (l.per_person_2 || total) opts.push({ key: "two", label: "2 people", per: "each", price: l.per_person_2 ?? Math.round(total / 2), icon: "👥" });
      if (l.per_person_3 || total) opts.push({ key: "three", label: "3 people", per: "each", price: l.per_person_3 ?? Math.round(total / 3), note: "Best value", icon: "👥👥" });
      if (l.per_person_4 || total) opts.push({ key: "four", label: "4 people", per: "each", price: l.per_person_4 ?? Math.round(total / 4), icon: "👥👥👥" });
      return opts;
    }
    const opts: RoomOption[] = [];
    if (l.has_single && l.price_single) opts.push({ key: "single", label: "Single Room", per: "for 1 person", price: l.price_single, icon: "👤" });
    if (l.has_double && l.price_double) opts.push({ key: "double", label: "Double Sharing", per: "per person · shared room", price: l.price_double, icon: "👥" });
    if (l.has_triple && l.price_triple) opts.push({ key: "triple", label: "Triple Sharing", per: "per person · shared room", price: l.price_triple, note: "Best value", icon: "👥👥" });
    return opts;
  }, [isFlat, l]);

  const cheapestPrice = roomOptions.reduce((m, o) => (o.price > 0 && (m === 0 || o.price < m) ? o.price : m), 0);
  const defaultKey = roomOptions.find((o) => o.note === "Best value")?.key
    ?? roomOptions.find((o) => o.price === cheapestPrice)?.key
    ?? roomOptions[0]?.key;
  const [selectedKey, setSelectedKey] = useState<string | undefined>(defaultKey);
  const selected = roomOptions.find((o) => o.key === selectedKey) ?? roomOptions[0];

  const foodIncluded = (l.food_type ?? "").toLowerCase() === "included";
  const electricityIncluded = boolish(l.electricity);
  const waterIncluded = boolish(l.water);
  const wifiIncluded = boolish(l.wifi);
  const laundryIncluded = boolish(l.laundry);

  const laundryCost = Number((l.laundry_cost ?? "").replace(/[^0-9]/g, "")) || (laundryIncluded ? 0 : 400);
  const metroPass = l.metro_fare ?? 0;
  const autoCost = l.auto_cost ?? 0;
  const monthlyTotal = (selected?.price ?? 0)
    + (foodIncluded ? 0 : 2500)
    + (electricityIncluded ? 0 : 500)
    + (waterIncluded ? 0 : 200)
    + (wifiIncluded ? 0 : 500)
    + laundryCost + metroPass + autoCost;

  const walkColor =
    (l.walk_min ?? 99) <= 15 ? "#5a6b2a" : (l.walk_min ?? 99) <= 25 ? "#c9a84c" : "#d94f2b";
  const securityCount = l.security?.length ?? 0;
  const securityScore = Math.min(5, l.security_score ?? securityCount);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: l.name, url }); return; } catch { /* cancelled */ }
    }
    try { await navigator.clipboard.writeText(url); toast.success("Link copied to clipboard"); } catch { toast.error("Could not copy link"); }
  };

  const openContact = () => {
    const digits = (l.owner_whatsapp ?? "").replace(/\D/g, "");
    if (!digits) { toast.error("Owner contact not available for this listing."); return; }
    const number = digits.startsWith("91") ? digits : `91${digits}`;
    const msg = encodeURIComponent(`Hi ${l.owner_name || "there"}, I found your listing "${l.name}" on HomeWise. I'm interested — can we talk?`);
    window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-navy pb-24 lg:pb-8">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <nav className="flex items-center gap-2 text-xs text-brand-cream/50 flex-wrap">
          <Link to="/" className="hover:text-brand-cream">Home</Link>
          <span className="text-brand-orange">›</span>
          <Link to="/listings" className="hover:text-brand-cream">Listings</Link>
          <span className="text-brand-orange">›</span>
          <span className="text-brand-cream/70">{l.college}</span>
          <span className="text-brand-orange">›</span>
          <span className="text-brand-orange truncate">{l.name}</span>
        </nav>
      </div>

      {/* Photo gallery */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
        <PhotoHeader photos={photos} name={l.name} type={l.type} onOpen={(i) => { setActivePhoto(i); setGalleryOpen(true); }} />
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* LEFT */}
        <div className="space-y-5 min-w-0">
          {/* Header card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(10,22,40,0.06)]">
            <div className="h-1 bg-brand-orange" />
            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <h1 className="font-tagline text-[22px] sm:text-2xl text-navy truncate">{l.name}</h1>
                <button onClick={share} aria-label="Share" className="shrink-0 w-10 h-10 rounded-full bg-secondary hover:bg-secondary/70 flex items-center justify-center text-navy">
                  <Share2 size={16} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-sm" style={{ color: "#1e5a8a" }}>
                <MapPin size={14} className="shrink-0" />
                <span className="truncate">{[l.address, l.locality].filter(Boolean).join(", ")} · Near {l.college}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge color="#5a6b2a">✓ Verified</StatusBadge>
                {l.gender && <StatusBadge color="#1e5a8a">{formatGender(l.gender)}</StatusBadge>}
                {l.is_featured && <StatusBadge color="#c9a84c" dark>⭐ Featured</StatusBadge>}
                {l.negotiable === "Yes" && <StatusBadge color="#d94f2b">Negotiable</StatusBadge>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBox icon="🚶" value={l.walk_min ? `${l.walk_min} min` : "—"} label="to college" />
                <StatBox icon="🚇" value={l.metro_walk_min ? `${l.metro_walk_min} min` : "—"} label="to metro" />
                <StatBox icon="🍽️" value={foodIncluded ? "Included" : l.food_type ?? "—"} label="food" />
                <StatBox icon="🔒" value={l.curfew && l.curfew !== "None" ? l.curfew : "None"} label="curfew" />
              </div>
            </div>
          </div>

          {/* Room types & pricing */}
          {roomOptions.length > 0 && (
            <SectionCard title="Room Types & Pricing">
              <div className="space-y-3">
                {roomOptions.map((r) => {
                  const active = r.key === selectedKey;
                  return (
                    <button
                      key={r.key}
                      onClick={() => setSelectedKey(r.key)}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                        active
                          ? "border-brand-orange bg-[#fff3ee]"
                          : "border-border bg-secondary hover:border-brand-orange/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <div className="text-[11px] font-extrabold uppercase tracking-widest text-brand-orange">{r.icon} {r.label}</div>
                          <div className="mt-1 text-navy">
                            <span className="text-2xl font-extrabold">₹{r.price.toLocaleString("en-IN")}</span>
                            <span className="text-sm text-muted-foreground"> / month {isFlat && r.key !== "solo" ? "per person" : ""}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{r.per}</div>
                        </div>
                        {r.note && (
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md" style={{ backgroundColor: "#5a6b2a", color: "white" }}>
                            ✓ {r.note}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {/* Food schedule */}
          {(l.breakfast_time || l.lunch_time || l.dinner_time) && (
            <SectionCard title="Food Schedule 🍽️">
              <div className="space-y-3">
                {l.breakfast_time && <MealRow icon="☀️" label="Breakfast" time={l.breakfast_time} menu={l.breakfast_menu} color="#c9a84c" />}
                {l.lunch_time && <MealRow icon="🌤️" label="Lunch" time={l.lunch_time} menu={l.lunch_menu} color="#d94f2b" />}
                {l.dinner_time && <MealRow icon="🌙" label="Dinner" time={l.dinner_time} menu={l.dinner_menu} color="#1e5a8a" />}
              </div>
            </SectionCard>
          )}

          {/* Monthly cost calculator */}
          <SectionCard title="Your Monthly Cost 💰">
            <div className="space-y-2 text-sm">
              <CostLine label={`Rent (${selected?.label ?? "—"})`} value={selected?.price ?? 0} />
              <CostLine label="Food" value={foodIncluded ? 0 : 2500} included={foodIncluded} />
              <CostLine label="Electricity" value={electricityIncluded ? 0 : 500} included={electricityIncluded} />
              <CostLine label="Water" value={waterIncluded ? 0 : 200} included={waterIncluded} />
              <CostLine label="WiFi / Internet" value={wifiIncluded ? 0 : 500} included={wifiIncluded} />
              <CostLine label="Laundry (dhobi)" value={laundryCost} included={laundryIncluded} />
              <CostLine label="Metro pass" value={metroPass} />
              {autoCost > 0 && <CostLine label="Auto to metro" value={autoCost} />}
            </div>
            <div className="mt-4 rounded-xl px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "#0a1628" }}>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-cream">Total / month</span>
              <span className="text-2xl font-extrabold text-brand-orange">₹{monthlyTotal.toLocaleString("en-IN")}</span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">*Estimates based on typical Delhi costs. Verify with owner.</p>
          </SectionCard>

          {/* Transport */}
          <SectionCard title="Getting Around 🚇">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <TransportBox
                icon="🚶"
                title="Walk to College"
                lines={[`${l.walk_min ?? "—"} minutes on foot`, "No cost · Healthiest"]}
                barColor={walkColor}
                barPct={Math.max(10, Math.min(100, 100 - (l.walk_min ?? 30) * 3))}
              />
              <TransportBox
                icon="🚇"
                title="Metro"
                lines={[
                  l.metro_station ? `${l.metro_station} · ${l.metro_walk_min ?? "—"} min walk` : "Not specified",
                  metroPass ? `Pass: ₹${metroPass}/mo` : "Pass: varies",
                ]}
              />
              <TransportBox
                icon="🛺"
                title="Auto / Rickshaw"
                lines={[autoCost > 0 ? `~₹${autoCost}/month` : "Walkable · not needed", "For late-night returns"]}
              />
            </div>
          </SectionCard>

          {/* Security */}
          <SectionCard title="Security & Safety 🛡️">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-bold text-navy">Security Score: {securityScore}/5</span>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <ShieldCheck key={i} size={16} style={{ color: i < securityScore ? "#d94f2b" : "#f0ebe3" }} className={i < securityScore ? "fill-[#d94f2b]" : ""} />
                ))}
              </div>
            </div>
            {(l.security?.length ?? 0) > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {l.security!.map((s) => (
                  <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-secondary text-navy">
                    <ShieldCheck size={14} className="text-brand-olive shrink-0" />
                    <span className="truncate">{s}</span>
                  </div>
                ))}
              </div>
            )}
            {l.curfew && l.curfew !== "None" && (
              <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#fff3ee] border border-brand-orange/20">
                <Clock size={16} className="text-brand-orange" />
                <span className="text-sm font-bold text-navy">Entry curfew: {l.curfew}</span>
              </div>
            )}
          </SectionCard>

          {/* Nearby */}
          {(l.gym_name || l.market || l.hospital || l.atm || l.pharmacy || l.jogging_spot) && (
            <SectionCard title="Nearby 📍">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {l.gym_name && <AmenityCard icon={<Dumbbell size={18} />} name={l.gym_name} detail={[l.gym_distance, l.gym_price ? `₹${l.gym_price}/mo` : null].filter(Boolean).join(" · ")} />}
                {l.market && <AmenityCard icon={<ShoppingCart size={18} />} name={l.market} detail="Shopping & food" />}
                {l.hospital && <AmenityCard icon={<Hospital size={18} />} name={l.hospital} detail="Nearest hospital" />}
                {l.atm && <AmenityCard icon={<CreditCard size={18} />} name={l.atm} detail="Nearest ATM" />}
                {l.pharmacy && <AmenityCard icon={<Pill size={18} />} name={l.pharmacy} detail="Pharmacy" />}
                {l.jogging_spot && <AmenityCard icon={<Trees size={18} />} name={l.jogging_spot} detail="Morning jog spot" />}
              </div>
            </SectionCard>
          )}

          {/* Expense breakdown */}
          <SectionCard title="Monthly Expenses Breakdown ⚡">
            <div className="divide-y divide-border">
              <ExpenseRow label="Electricity" cost={l.electricity_cost} included={electricityIncluded} />
              <ExpenseRow label="Water" cost={l.water_cost} included={waterIncluded} />
              <ExpenseRow label="WiFi / Internet" cost={l.wifi_cost} included={wifiIncluded} />
              <ExpenseRow label="Laundry / Dhobi" cost={l.laundry_cost} included={laundryIncluded} nearby />
              {l.cook_available && <ExpenseRow label="Cook (optional)" cost={l.cook_cost} optional />}
              {l.maid_available && <ExpenseRow label="Maid (optional)" cost={l.maid_cost} optional />}
            </div>
          </SectionCard>

          {l.area_description && (
            <SectionCard title="About the Area 🏘️">
              <p className="text-navy text-[15px] leading-[1.7] whitespace-pre-wrap">{l.area_description}</p>
            </SectionCard>
          )}
        </div>

        {/* RIGHT — sticky contact */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ContactCard
              name={l.name}
              cheapest={cheapestPrice}
              selected={selected}
              onContact={openContact}
              walkMin={l.walk_min}
              foodIncluded={foodIncluded}
              curfew={l.curfew}
              securityCount={securityCount}
              billsIncluded={electricityIncluded && waterIncluded}
              availableFrom={l.available_from}
              createdAt={l.created_at}
              isFlat={isFlat}
              onChangeRoom={() => document.getElementById("room-select")?.scrollIntoView({ behavior: "smooth", block: "center" })}
            />
          </div>
        </aside>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-border p-3 flex items-center justify-between gap-3 shadow-[0_-8px_24px_rgba(10,22,40,0.15)]">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">From</div>
          <div className="text-brand-orange font-extrabold text-lg">₹{(cheapestPrice || selected?.price || 0).toLocaleString("en-IN")}/mo</div>
        </div>
        <button onClick={openContact} className="bg-brand-orange text-white font-extrabold px-5 py-3 rounded-xl">Contact Owner</button>
      </div>

      {/* Fullscreen gallery modal */}
      {galleryOpen && photos.length > 0 && (
        <FullGallery photos={photos} start={activePhoto} onClose={() => setGalleryOpen(false)} />
      )}
    </div>
  );
}

/* ---------------- helpers ---------------- */

function formatGender(g: string) {
  const s = g.toLowerCase();
  if (s === "girls") return "Girls only";
  if (s === "boys") return "Boys only";
  return "Co-ed";
}

function StatusBadge({ color, dark, children }: { color: string; dark?: boolean; children: React.ReactNode }) {
  return (
    <span
      className="px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider"
      style={{ backgroundColor: color, color: dark ? "#0a1628" : "white" }}
    >
      {children}
    </span>
  );
}

function StatBox({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="rounded-xl bg-secondary p-3 text-center">
      <div className="text-lg">{icon}</div>
      <div className="mt-1 text-brand-orange font-extrabold text-sm leading-tight truncate">{value}</div>
      <div className="text-[10px] text-navy/70 uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_10px_rgba(10,22,40,0.05)]" id={title.startsWith("Room") ? "room-select" : undefined}>
      <h2 className="text-brand-orange font-extrabold text-xs uppercase mb-4" style={{ letterSpacing: "2px" }}>{title}</h2>
      {children}
    </section>
  );
}

function MealRow({ icon, label, time, menu, color }: { icon: string; label: string; time: string; menu: string | null; color: string }) {
  return (
    <div className="rounded-xl bg-secondary p-3 pl-4 border-l-4" style={{ borderLeftColor: color }}>
      <div className="text-[11px] font-extrabold uppercase tracking-wider text-navy">{icon} {label}</div>
      <div className="text-sm text-navy font-bold mt-0.5">{time}</div>
      {menu && <div className="text-xs text-muted-foreground mt-0.5">{menu}</div>}
    </div>
  );
}

function CostLine({ label, value, included }: { label: string; value: number; included?: boolean }) {
  return (
    <div className="flex items-center justify-between text-navy">
      <span>{label}</span>
      <span className="font-bold">
        {included ? <span className="text-brand-olive">₹0 ✅ included</span> : `₹${value.toLocaleString("en-IN")}`}
      </span>
    </div>
  );
}

function TransportBox({ icon, title, lines, barColor, barPct }: { icon: string; title: string; lines: string[]; barColor?: string; barPct?: number }) {
  return (
    <div className="rounded-xl bg-secondary p-4">
      <div className="text-[11px] font-extrabold uppercase tracking-wider text-navy">{icon} {title}</div>
      {lines.map((l, i) => (
        <div key={i} className={i === 0 ? "mt-2 text-sm font-bold text-navy" : "text-xs text-muted-foreground"}>{l}</div>
      ))}
      {barColor && barPct !== undefined && (
        <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${barPct}%`, backgroundColor: barColor }} />
        </div>
      )}
    </div>
  );
}

function AmenityCard({ icon, name, detail }: { icon: React.ReactNode; name: string; detail: string }) {
  return (
    <div className="rounded-xl bg-secondary p-3 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-brand-orange shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="font-bold text-navy text-sm truncate">{name}</div>
        <div className="text-xs" style={{ color: "#1e5a8a" }}>{detail || "Nearby"}</div>
      </div>
    </div>
  );
}

function ExpenseRow({ label, cost, included, nearby, optional }: { label: string; cost?: string | null; included?: boolean; nearby?: boolean; optional?: boolean }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2.5 text-sm">
      <span className="text-navy truncate">{label}</span>
      <span className="font-bold text-navy">{included ? "₹0" : cost || "—"}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md" style={{
        backgroundColor: included ? "#e9eddc" : optional ? "#e1ecf5" : "#fff3ee",
        color: included ? "#5a6b2a" : optional ? "#1e5a8a" : "#d94f2b",
      }}>
        {included ? "✓ Included" : optional ? "Optional" : nearby ? "Nearby" : "Extra"}
      </span>
    </div>
  );
}

function ContactCard({
  name, cheapest, selected, onContact, walkMin, foodIncluded, curfew, securityCount, billsIncluded, availableFrom, createdAt, isFlat, onChangeRoom,
}: {
  name: string; cheapest: number; selected?: RoomOption; onContact: () => void;
  walkMin: number | null; foodIncluded: boolean; curfew: string | null; securityCount: number;
  billsIncluded: boolean; availableFrom: string | null; createdAt: string | null; isFlat: boolean;
  onChangeRoom: () => void;
}) {
  const [daysListed, setDaysListed] = useState<number | null>(null);
  useEffect(() => {
    if (createdAt) setDaysListed(Math.max(1, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000)));
  }, [createdAt]);
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(10,22,40,0.15)]">
      <div className="h-1 bg-brand-orange" />
      <div className="p-6 space-y-4">
        <div>
          <div className="font-tagline text-lg text-navy truncate">{name}</div>
          <div className="mt-1 text-brand-orange text-2xl font-extrabold">From ₹{(cheapest || selected?.price || 0).toLocaleString("en-IN")}<span className="text-sm text-muted-foreground font-medium">/mo</span></div>
        </div>
        {selected && (
          <div className="rounded-xl bg-secondary p-3">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Currently viewing</div>
            <div className="text-navy font-bold mt-0.5">{selected.label}</div>
            <div className="text-sm text-muted-foreground">₹{selected.price.toLocaleString("en-IN")} / month {isFlat && selected.key !== "solo" ? "per person" : ""}</div>
            <button onClick={onChangeRoom} className="mt-1 text-xs font-bold text-brand-orange hover:underline">Change room type</button>
          </div>
        )}
        <button onClick={onContact} className="w-full text-white font-extrabold py-3.5 rounded-xl transition-colors" style={{ backgroundColor: "#25d366" }}>
          💬 Contact Owner on WhatsApp
        </button>
        <div className="border-t border-border pt-4 space-y-2 text-sm text-navy">
          {walkMin != null && <div>🚶 {walkMin} min walk to college</div>}
          <div>🍽️ Food {foodIncluded ? "included" : "not included"}</div>
          <div>🔒 Curfew {curfew && curfew !== "None" ? curfew : "None"}</div>
          <div>🛡️ {securityCount} security feature{securityCount === 1 ? "" : "s"}</div>
          <div>⚡ Bills {billsIncluded ? "included" : "extra"}</div>
        </div>
        <div className="border-t border-border pt-4 space-y-2 text-xs">
          {availableFrom && <div className="text-brand-olive font-bold">🟢 Available from {new Date(availableFrom).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</div>}
          <div className="text-muted-foreground">✅ Verified by HomeWise</div>
          {daysListed && <div className="text-muted-foreground">🏠 Listed {daysListed} day{daysListed === 1 ? "" : "s"} ago</div>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Photo header ---------------- */

function PhotoHeader({ photos, name, type, onOpen }: { photos: string[]; name: string; type: string | null; onOpen: (i: number) => void }) {
  const [swipeIdx, setSwipeIdx] = useState(0);
  const count = photos.length;

  if (count === 0) {
    return (
      <div className="w-full h-[280px] sm:h-[420px] rounded-2xl flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1628 0%, #1e5a8a 100%)" }}>
        {(type ?? "").toLowerCase() === "flat"
          ? <Building2 size={80} className="text-brand-cream/50" />
          : <HomeIcon size={80} className="text-brand-cream/50" />}
        <div className="absolute font-tagline text-brand-cream text-2xl mt-40 text-center px-4">{name}</div>
      </div>
    );
  }

  if (count === 1) {
    return (
      <button onClick={() => onOpen(0)} className="block w-full h-[280px] sm:h-[420px] rounded-2xl overflow-hidden">
        <img src={photos[0]} alt={name} className="w-full h-full object-cover" />
      </button>
    );
  }

  return (
    <>
      {/* Desktop grid */}
      <div className="hidden sm:grid grid-cols-[3fr_2fr] gap-2 h-[420px] rounded-2xl overflow-hidden relative">
        <button onClick={() => onOpen(0)} className="relative h-full">
          <img src={photos[0]} alt={name} className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
        </button>
        <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
          {photos.slice(1, 5).map((p, i) => (
            <button key={i} onClick={() => onOpen(i + 1)} className="h-full">
              <img src={p} alt={`${name} ${i + 2}`} className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
            </button>
          ))}
        </div>
        {count > 5 && (
          <button onClick={() => onOpen(0)} className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-navy font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-2">
            <Camera size={14} /> View all {count} photos
          </button>
        )}
      </div>
      {/* Mobile swipe */}
      <div className="sm:hidden">
        <div className="relative w-full h-[280px] rounded-2xl overflow-hidden">
          <img src={photos[swipeIdx]} alt={name} className="w-full h-full object-cover" onClick={() => onOpen(swipeIdx)} />
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <button key={i} onClick={() => setSwipeIdx(i)} className={`h-1.5 rounded-full transition-all ${i === swipeIdx ? "bg-white w-6" : "bg-white/50 w-1.5"}`} aria-label={`Photo ${i + 1}`} />
            ))}
          </div>
          <div className="absolute top-3 right-3 bg-navy/70 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur">{swipeIdx + 1} / {count}</div>
        </div>
      </div>
    </>
  );
}

function FullGallery({ photos, start, onClose }: { photos: string[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const prev = () => setI((v) => (v - 1 + photos.length) % photos.length);
  const next = () => setI((v) => (v + 1) % photos.length);
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20" aria-label="Close">
        <X size={20} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20" aria-label="Previous">
        <ChevronLeft size={22} />
      </button>
      <img src={photos[i]} alt={`Photo ${i + 1}`} className="max-h-[90vh] max-w-[92vw] object-contain" onClick={(e) => e.stopPropagation()} />
      <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20" aria-label="Next">
        <ChevronRight size={22} />
      </button>
      <div className="absolute bottom-6 text-white/80 text-sm font-bold">{i + 1} / {photos.length}</div>
    </div>
  );
}
