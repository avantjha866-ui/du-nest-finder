import { useState } from "react";
import {
  Clock, Train, ShieldCheck, Star, Heart, Users,
  Sparkles, Eye, Calculator, Award, MessageCircle,
} from "lucide-react";
import { type Listing, securityScore } from "@/lib/data";
import { useCompareList, useInterests } from "@/lib/store";
import { toast } from "sonner";
import { PhotoGallery } from "@/components/PhotoGallery";
import { NearbyColleges } from "@/components/NearbyColleges";
import { WhatsAppContact } from "@/components/WhatsAppContact";
import { StudentReviews } from "@/components/StudentReviews";

export function ListingCard({ listing }: { listing: Listing }) {
  const { has, toggle } = useCompareList();
  const { countFor, add } = useInterests();
  const [showInterest, setShowInterest] = useState(false);
  const [parentView, setParentView] = useState(false);
  const [budget, setBudget] = useState("");

  const saved = has(listing.id);
  const score = securityScore(listing.security);
  const interested = countFor(listing.id);

  const walkColor =
    listing.walkMinutes <= 15 ? "bg-brand-green"
    : listing.walkMinutes <= 25 ? "bg-amber-500"
    : "bg-red-500";

  const negotiationBadge =
    listing.negotiable === "Yes" ? <Badge color="amber">Open to negotiate</Badge>
    : listing.negotiable === "Flexible" ? <Badge color="amber">Flexible terms</Badge>
    : <Badge color="red">Fixed rent</Badge>;

  const perPersonCosts = listing.type === "Flat" && listing.idealSharers
    ? { 1: listing.rent, 2: Math.round(listing.rent / 2), 3: Math.round(listing.rent / 3) }
    : null;

  // Parse room prices from notes
  const roomPrices: { single?: number; double?: number; triple?: number } = {};
  if (listing.type === "PG") {
    const n = listing.localityDesc ?? "";
    const s = n.match(/Single: ₹(\d+)/); const d = n.match(/Double: ₹(\d+)/); const t = n.match(/Triple: ₹(\d+)/);
    if (s) roomPrices.single = Number(s[1]);
    if (d) roomPrices.double = Number(d[1]);
    if (t) roomPrices.triple = Number(t[1]);
  }

  const groupSize = listing.idealSharers ?? 3;
  const filled = listing.flatmates?.length ?? 0;
  const empty = Math.max(0, groupSize - filled);
  const groupComplete = listing.type === "Flat" && empty === 0 && filled > 0;

  const effectiveRent = listing.type === "Flat"
    ? Math.round(listing.rent / (listing.idealSharers ?? 3))
    : listing.rent;

  if (parentView) {
    return (
      <article className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Parent view — {listing.name}</h3>
          <button onClick={() => setParentView(false)} className="text-xs text-muted-foreground hover:text-foreground">
            Back to full view
          </button>
        </div>
        <dl className="space-y-3 text-sm">
          <Row label="Address">{listing.locality}, near {listing.college}</Row>
          <Row label="Security">{listing.security.join(" · ")}</Row>
          <Row label="Curfew">{listing.curfew}</Row>
          <Row label="Owner contact">Available through DUNest</Row>
        </dl>
        {listing.whatsapp ? (
          <WhatsAppContact
            whatsapp={listing.whatsapp}
            listingName={listing.name}
            className="mt-5 w-full"
            label="Contact owner on WhatsApp"
          />
        ) : (
          <p className="mt-4 text-xs text-muted-foreground text-center">Contact available through DUNest</p>
        )}
      </article>
    );
  }

  return (
    <article className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">

      {/* Photo gallery */}
      <PhotoGallery photos={listing.photos ?? []} name={listing.name} />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold leading-tight">{listing.name}</h3>
            {listing.bestMatch && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-brand-green text-white px-2 py-0.5 rounded-full">
                <Sparkles size={10} /> Best match
              </span>
            )}
            {listing.founding && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-navy text-white px-2 py-0.5 rounded-full">
                <Award size={10} /> Founding listing
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {listing.locality} · near {listing.college}
            {listing.bhk && ` · ${listing.bhk}`}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1 italic">{listing.localityDesc}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-bold text-navy">
            ₹{listing.rent.toLocaleString("en-IN")}
            <span className="text-sm font-normal text-muted-foreground">/mo</span>
          </div>
          {listing.type === "Flat" && (
            <div className="text-xs text-muted-foreground">total rent · ₹{effectiveRent.toLocaleString("en-IN")}/person</div>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge color="navy">{listing.gender}</Badge>
        <Badge color="navy">{listing.food}</Badge>
        {listing.ac && <Badge color="navy">AC</Badge>}
        {listing.security.map((s) => <Badge key={s} color="muted">{s}</Badge>)}
        {negotiationBadge}
      </div>

      {/* Walk progress */}
      <div className="mb-5">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-medium">Walk to {listing.college}</span>
          <span className="text-muted-foreground">{listing.walkMinutes} min</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className={`h-full ${walkColor}`} style={{ width: `${Math.min(100, (listing.walkMinutes / 35) * 100)}%` }} />
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Info icon={<Clock size={14} />} label="Curfew" value={listing.curfew} />
        <Info icon={<Train size={14} />} label="Metro" value={listing.metroStation || "—"} />
        <Info icon={<Train size={14} />} label="Metro walk" value={`${listing.metroWalk} min`} />
        <Info icon={<Clock size={14} />} label="Metro pass" value={listing.metroPass > 0 ? `₹${listing.metroPass}/mo` : "—"} />
      </div>

      {/* Nearby colleges distances */}
      <NearbyColleges
        locality={listing.locality}
        primaryCollege={listing.college}
        walkMinutes={listing.walkMinutes}
        metroStation={listing.metroStation}
        metroWalk={listing.metroWalk}
        metroPass={listing.metroPass}
      />

      {/* Per-person cost for flat */}
      {perPersonCosts && (
        <div className="mb-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Per person / month</div>
          <div className="grid grid-cols-3 gap-2">
            <PerPerson amount={perPersonCosts[1]} tone="red" label="Solo" />
            <PerPerson amount={perPersonCosts[2]} tone="amber" label="2 sharing" />
            <PerPerson amount={perPersonCosts[3]} tone="green" label="3 sharing ★" />
          </div>
        </div>
      )}

      {/* Room-wise pricing for PG */}
      {listing.type === "PG" && Object.keys(roomPrices).length > 0 && (
        <div className="mb-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Room-wise pricing</div>
          <div className="grid grid-cols-3 gap-2">
            {roomPrices.single && <PerPerson amount={roomPrices.single} tone="red" label="Single" />}
            {roomPrices.double && <PerPerson amount={roomPrices.double} tone="amber" label="Double" />}
            {roomPrices.triple && <PerPerson amount={roomPrices.triple} tone="green" label="Triple ★" />}
          </div>
        </div>
      )}

      {/* Flatmate slots */}
      {listing.type === "Flat" && (
        <div className="mb-5 bg-navy text-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Users size={14} className="text-brand-green" /> Flatmate slots ({filled}/{groupSize})
            </h4>
            {groupComplete && <span className="text-[10px] bg-brand-green px-2 py-0.5 rounded-full">🎉 Group complete</span>}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {listing.flatmates?.map((f) => (
              <div key={f.name} className="bg-white/5 border border-brand-green/40 rounded-lg p-2.5 text-xs">
                <div className="font-semibold text-brand-green">{f.name}</div>
                <div className="text-white/60 text-[10px] mt-0.5">{f.year}</div>
                <div className="text-white/60 text-[10px]">{f.course}</div>
              </div>
            ))}
            {Array.from({ length: empty }).map((_, i) => (
              <button key={i} onClick={() => setShowInterest(true)}
                className="border-2 border-dashed border-white/20 rounded-lg p-2.5 text-xs text-white/60 hover:border-brand-green hover:text-brand-green transition-colors flex flex-col items-center justify-center min-h-[68px]">
                <span className="text-xl leading-none">+</span>
                <span className="mt-1">Open slot</span>
              </button>
            ))}
          </div>
          {interested > 0 && !groupComplete && (
            <p className="text-xs text-white/70 mt-3">{interested} student{interested > 1 ? "s" : ""} have shown interest</p>
          )}
        </div>
      )}

      {/* Food schedule */}
      {listing.meals && (Object.values(listing.meals).some(Boolean)) && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold mb-2">Food schedule</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(["breakfast", "lunch", "dinner"] as const).map((m) =>
              listing.meals?.[m] ? (
                <div key={m} className="bg-secondary rounded-lg p-3">
                  <div className="text-[10px] font-bold uppercase text-brand-green-dark">{m}</div>
                  <div className="text-xs font-medium mt-0.5">{listing.meals[m]!.timing}</div>
                  <div className="text-xs text-muted-foreground mt-1">{listing.meals[m]!.menu}</div>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Expenses */}
      <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Box title="Monthly expenses">
          <KV k="Electricity" v={listing.electricity} />
          <KV k="Water" v={listing.water} />
          <KV k="Laundry" v={listing.laundry} />
          <KV k="Internet" v={listing.internet} />
          {listing.maid && <KV k="Maid (shared)" v={`₹${listing.maid}/mo`} />}
          {listing.cook && <KV k="Cook (shared)" v={`₹${listing.cook}/mo`} />}
          {listing.deposit && <KV k="Deposit" v={`₹${listing.deposit.toLocaleString("en-IN")}`} />}
        </Box>
        <Box title="Transport">
          <KV k="Metro pass" v={listing.metroPass > 0 ? `₹${listing.metroPass}/mo` : "—"} />
          <KV k="Walk to college" v={listing.walkMinutes <= 20 ? "₹0 (walkable)" : "Auto recommended"} />
          {listing.autoCost ? <KV k="Auto / e-rickshaw" v={`~₹${listing.autoCost}/mo`} /> : null}
        </Box>
      </div>

      {/* Amenities */}
      {Object.values(listing.amenities).some(Boolean) && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold mb-2">Nearby amenities</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {listing.amenities.gym && <Tile label="Gym">{listing.amenities.gym.name}{listing.amenities.gym.distance ? ` · ${listing.amenities.gym.distance}` : ""}{listing.amenities.gym.fee ? ` · ₹${listing.amenities.gym.fee}/mo` : ""}</Tile>}
            {listing.amenities.jogging && <Tile label="Jogging">{listing.amenities.jogging.name}</Tile>}
            {listing.amenities.market && <Tile label="Market">{listing.amenities.market.name}{listing.amenities.market.walk ? ` · ${listing.amenities.market.walk}` : ""}</Tile>}
            {listing.amenities.hospital && <Tile label="Hospital">{listing.amenities.hospital.name}</Tile>}
            {listing.amenities.atm && <Tile label="ATM">{listing.amenities.atm.name}</Tile>}
            {listing.amenities.pharmacy && <Tile label="Pharmacy">{listing.amenities.pharmacy.name}</Tile>}
            {listing.amenities.laundryShop && <Tile label="Dhobi">{listing.amenities.laundryShop.walk}</Tile>}
          </div>
        </div>
      )}

      {/* Security score */}
      <div className="mb-5 flex items-center justify-between bg-secondary rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck size={16} className="text-brand-green" /> Security score
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} className={i < score ? "fill-brand-green text-brand-green" : "text-border"} />
          ))}
        </div>
      </div>

      {/* Budget checker */}
      <div className="mb-5 border border-dashed border-border rounded-xl p-4">
        <label className="text-sm font-semibold flex items-center gap-2">
          <Calculator size={14} className="text-brand-green" /> Does this fit your budget?
        </label>
        <div className="mt-2 flex gap-2">
          <input type="number" placeholder="Your monthly budget ₹" value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm" />
        </div>
        {budget && Number(budget) > 0 && (
          <p className={`mt-2 text-sm font-medium ${Number(budget) >= effectiveRent ? "text-brand-green-dark" : "text-red-600"}`}>
            {Number(budget) >= effectiveRent
              ? "✓ Fits your budget"
              : `Over budget by ₹${(effectiveRent - Number(budget)).toLocaleString("en-IN")} — try negotiating or adding a flatmate`}
          </p>
        )}
      </div>

      {/* Student reviews */}
      <StudentReviews listingId={listing.id} listingName={listing.name} />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => { toggle(listing.id); toast.success(saved ? "Removed from compare" : "Saved to compare"); }}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border transition-colors ${saved ? "bg-accent border-brand-green text-brand-green-dark" : "bg-white border-border hover:border-foreground/30"}`}
        >
          <Heart size={16} className={saved ? "fill-brand-green text-brand-green" : ""} />
          {saved ? "Saved" : "Save to compare"}
        </button>

        {listing.whatsapp ? (
          <WhatsAppContact
            whatsapp={listing.whatsapp}
            listingName={listing.name}
            className="flex-1"
            label={listing.type === "Flat" ? "WhatsApp owner" : "WhatsApp owner"}
          />
        ) : listing.type === "Flat" ? (
          <button onClick={() => setShowInterest(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-brand-green hover:bg-brand-green-dark text-white">
            <Users size={16} /> Show interest
          </button>
        ) : (
          <button disabled className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-secondary text-muted-foreground">
            <MessageCircle size={16} /> Contact via DUNest
          </button>
        )}

        <button onClick={() => setParentView(true)}
          className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-navy text-white hover:bg-navy-light"
          title="Parent view">
          <Eye size={16} /> Parent
        </button>
      </div>

      {showInterest && (
        <InterestModal
          listing={listing}
          onClose={() => setShowInterest(false)}
          onSubmit={(entry) => {
            add(entry);
            const wouldComplete = (interested + 1) + filled >= groupSize;
            toast.success(wouldComplete ? "🎉 Group complete! We'll connect everyone on WhatsApp" : "Interest submitted — we'll be in touch");
            setShowInterest(false);
          }}
        />
      )}
    </article>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Badge({ children, color }: { children: React.ReactNode; color: "navy" | "amber" | "red" | "muted" }) {
  const map = { navy: "bg-navy/5 text-navy border-navy/10", amber: "bg-amber-50 text-amber-700 border-amber-200", red: "bg-red-50 text-red-700 border-red-200", muted: "bg-secondary text-muted-foreground border-border" };
  return <span className={`text-[11px] font-medium px-2 py-1 rounded-md border ${map[color]}`}>{children}</span>;
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-secondary rounded-lg p-2.5">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">{icon} {label}</div>
      <div className="text-xs font-semibold mt-0.5">{value}</div>
    </div>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-xl p-3">
      <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v}</span>
    </div>
  );
}

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-secondary rounded-lg px-3 py-2">
      <div className="text-[10px] font-bold uppercase text-muted-foreground">{label}</div>
      <div className="text-xs font-medium mt-0.5">{children}</div>
    </div>
  );
}

function PerPerson({ amount, tone, label }: { amount: number; tone: "red" | "amber" | "green"; label: string }) {
  const map = { red: "bg-red-50 text-red-700 border-red-200", amber: "bg-amber-50 text-amber-700 border-amber-200", green: "bg-accent text-brand-green-dark border-brand-green/30" };
  return (
    <div className={`border rounded-lg p-2.5 text-center ${map[tone]}`}>
      <div className="text-[10px] font-bold uppercase">{label}</div>
      <div className="font-bold text-sm mt-1">₹{amount.toLocaleString("en-IN")}</div>
      <div className="text-[10px] opacity-70">per person</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-border pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right">{children}</dd>
    </div>
  );
}

function InterestModal({ listing, onClose, onSubmit }: {
  listing: Listing;
  onClose: () => void;
  onSubmit: (entry: { listingId: string; name: string; collegeYear: string; course: string; moveIn: string; budget: number; genderPref: string; whatsapp: string }) => void;
}) {
  const [form, setForm] = useState({ name: "", college: listing.college as string, year: "1st year", course: "", moveIn: "", budget: "", genderPref: "Any", whatsapp: "" });
  const upd = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold">Show interest</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <p className="text-sm text-muted-foreground mb-5">We'll group you with matching flatmates for <strong>{listing.name}</strong>.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!form.name || !form.whatsapp) { toast.error("Name and WhatsApp required"); return; }
            onSubmit({ listingId: listing.id, name: form.name, collegeYear: `${form.college} · ${form.year}`, course: form.course, moveIn: form.moveIn, budget: Number(form.budget) || 0, genderPref: form.genderPref, whatsapp: form.whatsapp });
          }} className="space-y-3">
            <Field label="Name" value={form.name} onChange={(v) => upd("name", v)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="College" value={form.college} onChange={(v) => upd("college", v)} />
              <SelectField label="Year" value={form.year} onChange={(v) => upd("year", v)} options={["1st year", "2nd year", "3rd year", "Final year", "Postgrad"]} />
            </div>
            <Field label="Course" value={form.course} onChange={(v) => upd("course", v)} />
            <div className="grid grid-cols-2 gap-3">
              <Field type="date" label="Move-in date" value={form.moveIn} onChange={(v) => upd("moveIn", v)} />
              <Field type="number" label="Budget / month" value={form.budget} onChange={(v) => upd("budget", v)} />
            </div>
            <SelectField label="Flatmate gender pref" value={form.genderPref} onChange={(v) => upd("genderPref", v)} options={["Any", "Girls only", "Boys only"]} />
            <Field label="WhatsApp number" value={form.whatsapp} onChange={(v) => upd("whatsapp", v)} placeholder="10-digit number" />
            <button type="submit" className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-semibold py-3 rounded-xl mt-2">Submit interest</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40" />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
