import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Camera, Home, Building2, ShieldCheck, Utensils, Snowflake, Train, Zap } from "lucide-react";
import { useState } from "react";
import type { Listing } from "@/lib/data";
import { useCompareList } from "@/lib/store";

type BudgetOption = { label: string; price: number; fits: boolean };

export function ListingGridCard({
  listing,
  budget = 0,
  budgetOptions = [],
}: {
  listing: Listing;
  budget?: number;
  budgetOptions?: BudgetOption[];
}) {
  const { has, toggle } = useCompareList();
  const [saved, setSaved] = useState(false);
  const cover = listing.photos?.[0];
  const photoCount = listing.photos?.length ?? 0;

  const priceLabel = listing.type === "PG"
    ? (listing.rent > 0 ? `From ₹${listing.rent.toLocaleString("en-IN")}/mo` : "Price on request")
    : (listing.perPerson?.three ? `₹${listing.perPerson.three.toLocaleString("en-IN")}/person` : listing.totalRent ? `₹${listing.totalRent.toLocaleString("en-IN")}/mo` : "Price on request");

  const roomChips = listing.type === "PG"
    ? [
        listing.roomPrices?.single ? { label: "Single", price: listing.roomPrices.single } : null,
        listing.roomPrices?.double ? { label: "Double", price: listing.roomPrices.double } : null,
        listing.roomPrices?.triple ? { label: "Triple", price: listing.roomPrices.triple } : null,
      ].filter(Boolean) as { label: string; price: number }[]
    : [
        listing.perPerson?.two ? { label: "2 share", price: listing.perPerson.two } : null,
        listing.perPerson?.three ? { label: "3 share", price: listing.perPerson.three } : null,
        listing.perPerson?.four ? { label: "4 share", price: listing.perPerson.four } : null,
      ].filter(Boolean) as { label: string; price: number }[];

  const walkColor =
    listing.walkMinutes <= 15 ? "text-brand-olive bg-[#e9eddc]"
    : listing.walkMinutes <= 25 ? "text-[#a3701f] bg-[#faedd1]"
    : "text-brand-orange bg-[#fbe5dc]";

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`/api/public/contact/${listing.id}`, "_blank", "noopener");
  };

  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="group block bg-white rounded-2xl overflow-hidden border border-border shadow-[0_2px_10px_rgba(10,22,40,0.04)] hover:shadow-[0_16px_40px_rgba(10,22,40,0.12)] hover:-translate-y-0.5 transition-all"
    >
      {/* Photo */}
      <div className="relative h-[220px] overflow-hidden">
        {cover ? (
          <img src={cover} alt={listing.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a1628 0%, #1e5a8a 100%)" }}>
            {listing.type === "PG"
              ? <Home size={56} className="text-brand-cream/40" />
              : <Building2 size={56} className="text-brand-cream/40" />}
          </div>
        )}

        {/* top-left type pill */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-orange text-white shadow-md">
            {listing.type}
          </span>
        </div>

        {/* top-right featured/verified */}
        <div className="absolute top-3 right-3 flex gap-2">
          {listing.featured ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-[#0a1628] shadow-md" style={{ backgroundColor: "#c9a84c" }}>
              ⭐ Featured
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-olive text-white shadow-md">
              ✓ Verified
            </span>
          )}
        </div>

        {/* bottom-left price */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1.5 rounded-lg text-sm font-extrabold text-white backdrop-blur" style={{ backgroundColor: "rgba(10,22,40,0.75)" }}>
            {priceLabel}
          </span>
        </div>

        {/* bottom-right heart + photo count */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {photoCount > 1 && (
            <span className="px-2 py-1 rounded-md text-[11px] font-semibold text-white flex items-center gap-1 backdrop-blur" style={{ backgroundColor: "rgba(10,22,40,0.7)" }}>
              <Camera size={12} /> {photoCount}
            </span>
          )}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSaved(s => !s); toggle(listing.id); }}
            aria-label="Save listing"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/90 hover:bg-white transition-colors"
          >
            <Heart size={16} className={saved || has(listing.id) ? "fill-brand-orange text-brand-orange" : "text-navy"} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* row 1: name + walk */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-tagline text-[16px] text-navy leading-snug line-clamp-1">{listing.name}</h3>
          {listing.walkMinutes > 0 && (
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold ${walkColor}`}>
              🚶 {listing.walkMinutes} min
            </span>
          )}
        </div>

        {/* row 2: locality */}
        <div className="flex items-center gap-1.5 text-[13px]" style={{ color: "#1e5a8a" }}>
          <MapPin size={13} />
          <span className="truncate">{listing.locality} · Near {listing.college}</span>
        </div>

        {/* row 3: quick badges */}
        <div className="flex flex-wrap gap-1.5">
          <MiniBadge>{listing.gender}</MiniBadge>
          {listing.food !== "None" && <MiniBadge icon={<Utensils size={10} />}>{listing.food}</MiniBadge>}
          {listing.ac && <MiniBadge icon={<Snowflake size={10} />}>AC</MiniBadge>}
          {listing.security.length > 0 && <MiniBadge icon={<ShieldCheck size={10} />}>{listing.security.length} security</MiniBadge>}
        </div>

        {/* row 4: room chips */}
        {roomChips.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-0.5">
            {roomChips.map((r) => {
              const fits = budget > 0 && r.price <= budget;
              return (
                <span
                  key={r.label}
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                    fits
                      ? "text-white"
                      : "text-navy bg-secondary border border-border"
                  }`}
                  style={fits ? { backgroundColor: "#5a6b2a" } : undefined}
                >
                  {fits && "✓ "}{r.label} ₹{r.price.toLocaleString("en-IN")}
                </span>
              );
            })}
          </div>
        )}

        {/* row 5: key strip */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
          <span className="flex items-center gap-1"><Utensils size={11} className="text-brand-orange" /> {listing.food === "Included" ? "Food incl." : listing.food}</span>
          {listing.metroStation && listing.metroStation !== "Not specified" && (
            <span className="flex items-center gap-1"><Train size={11} className="text-brand-orange" /> {listing.metroStation}</span>
          )}
          <span className="flex items-center gap-1"><Zap size={11} className="text-brand-orange" /> {listing.electricity === "Included" ? "Bills incl." : "Bills extra"}</span>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-brand-orange text-sm font-bold group-hover:underline">View Details →</span>
          <button
            onClick={handleContact}
            className="bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
          >
            Contact Owner
          </button>
        </div>
      </div>
    </Link>
  );
}

function MiniBadge({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-secondary text-navy border border-border">
      {icon}{children}
    </span>
  );
}
