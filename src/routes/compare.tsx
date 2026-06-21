import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { Listing } from "@/lib/data";
import { getApprovedListings } from "@/lib/listings.functions";
import { useCompareList } from "@/lib/store";
import { X, Sparkles, CheckCircle2, XCircle, MessageCircle } from "lucide-react";
import { WhatsAppContact } from "@/components/WhatsAppContact";

const listingsQueryOptions = queryOptions({
  queryKey: ["approved-listings"],
  queryFn: () => getApprovedListings(),
});

function CompareError({ error }: { error: Error }) {
  return <div role="alert" className="p-8 text-center text-destructive">{error.message}</div>;
}

function CompareNotFound() {
  return <div className="p-8 text-center text-muted-foreground">No listings found.</div>;
}

export const Route = createFileRoute("/compare")({
  loader: ({ context }) => context.queryClient.ensureQueryData(listingsQueryOptions),
  head: () => ({
    meta: [
      { title: "Compare PG vs Flat — DUNest" },
      {
        name: "description",
        content:
          "Compare the real monthly cost of PGs and flats near Delhi University — every expense included.",
      },
    ],
  }),
  errorComponent: CompareError,
  notFoundComponent: CompareNotFound,
  component: ComparePage,
});

type CostRow = {
  label: string;
  value: (l: ReturnType<typeof costFor>) => string;
  amount: (l: ReturnType<typeof costFor>) => number;
};

function parseNum(s: string): number {
  if (!s) return 0;
  if (/included/i.test(s)) return 0;
  const m = s.match(/(\d{2,5})/g);
  if (!m) return 0;
  // Average if range
  const nums = m.map(Number);
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function costFor(listing: Listing) {
  const share = listing.type === "Flat" ? listing.idealSharers ?? 3 : 1;
  const perPersonRent = Math.round(listing.rent / share);
  return {
    listing,
    share,
    rent: perPersonRent,
    food: listing.food === "Included" ? 0 : listing.food === "Tiffin service" ? 3500 : 4500,
    electricity: parseNum(listing.electricity),
    water: parseNum(listing.water),
    maid: listing.maid ? Math.round(listing.maid / share) : 0,
    cook: listing.cook ? Math.round(listing.cook / share) : 0,
    laundry: parseNum(listing.laundry),
    internet: /included/i.test(listing.internet) ? 0 : parseNum(listing.internet),
    metro: listing.metroPass,
    auto: listing.autoCost ?? 0,
    gym: listing.amenities.gym?.fee ?? 0,
  };
}

const ROWS: { label: string; key: keyof ReturnType<typeof costFor> }[] = [
  { label: "Rent (per person)", key: "rent" },
  { label: "Food", key: "food" },
  { label: "Electricity", key: "electricity" },
  { label: "Water charges", key: "water" },
  { label: "Maid / cleaning", key: "maid" },
  { label: "Cook", key: "cook" },
  { label: "Laundry / dhobi", key: "laundry" },
  { label: "Internet / WiFi", key: "internet" },
  { label: "Metro monthly pass", key: "metro" },
  { label: "Auto / rickshaw", key: "auto" },
  { label: "Gym membership", key: "gym" },
];

// Non-cost amenity comparison rows
const AMENITY_ROWS: { label: string; get: (l: Listing) => string }[] = [
  { label: "AC", get: (l) => l.ac ? "✓ Yes" : "✗ No" },
  { label: "Curfew", get: (l) => l.curfew || "None" },
  { label: "Gender", get: (l) => l.gender },
  { label: "Security", get: (l) => l.security.length > 0 ? l.security.join(", ") : "—" },
  { label: "Gym", get: (l) => l.amenities.gym ? `${l.amenities.gym.name} (₹${l.amenities.gym.fee}/mo)` : "—" },
  { label: "Market", get: (l) => l.amenities.market?.name ?? "—" },
  { label: "Metro station", get: (l) => l.metroStation || "—" },
  { label: "Walk to college", get: (l) => `${l.walkMinutes} min` },
  { label: "Deposit", get: (l) => l.deposit ? `₹${l.deposit.toLocaleString("en-IN")}` : "—" },
  { label: "Negotiable", get: (l) => l.negotiable },
];

function ComparePage() {
  const { ids, remove, clear } = useCompareList();
  const { data: listings } = useSuspenseQuery(listingsQueryOptions);
  const selected = listings.filter((l) => ids.includes(l.id));

  if (selected.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Compare any PG or Flat</h1>
        <p className="mt-3 text-muted-foreground">
          Save listings from search results to compare them side by side — PG vs PG, Flat vs Flat, or PG vs Flat.
        </p>
        <Link
          to="/listings"
          className="inline-flex mt-6 bg-brand-green hover:bg-brand-green-dark text-white font-semibold px-6 py-3 rounded-xl"
        >
          Browse listings
        </Link>
      </div>
    );
  }

  const costs = selected.map(costFor);
  const totals = costs.map((c) =>
    ROWS.reduce((sum, r) => sum + (c[r.key] as number), 0),
  );

  const minIdx = totals.indexOf(Math.min(...totals));
  const cheapest = selected[minIdx];

  return (
    <div className="bg-navy-soft min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Compare listings — your real monthly cost</h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Compare any PGs or Flats side by side. Every expense included.
            </p>
          </div>
          <button
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-destructive underline"
          >
            Clear all
          </button>
        </div>

        {/* Table */}
        <div className="mt-6 bg-white border border-border rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold text-muted-foreground">Expense</th>
                {selected.map((l) => (
                  <th key={l.id} className="p-4 text-left min-w-[180px]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold">{l.name}</div>
                        <div className="text-xs text-muted-foreground font-normal">
                          {l.type} · {l.locality}
                        </div>
                      </div>
                      <button
                        onClick={() => remove(l.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label} className="border-b border-border/60">
                  <td className="p-4 text-muted-foreground">{r.label}</td>
                  {costs.map((c, i) => (
                    <td key={i} className="p-4 font-medium">
                      {(c[r.key] as number) === 0 ? (
                        <span className="text-muted-foreground/60">—</span>
                      ) : (
                        `₹${(c[r.key] as number).toLocaleString("en-IN")}`
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-navy text-white">
                <td className="p-4 font-bold">TOTAL / month</td>
                {totals.map((t, i) => (
                  <td key={i} className="p-4 text-xl font-bold text-brand-green">
                    ₹{t.toLocaleString("en-IN")}
                  </td>
                ))}
              </tr>
              {/* Amenities comparison */}
              <tr className="bg-secondary">
                <td colSpan={selected.length + 1} className="p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Amenities & details</td>
              </tr>
              {AMENITY_ROWS.map((r) => (
                <tr key={r.label} className="border-b border-border/60">
                  <td className="p-4 text-muted-foreground">{r.label}</td>
                  {selected.map((l, i) => (
                    <td key={i} className="p-4 text-sm font-medium">{r.get(l)}</td>
                  ))}
                </tr>
              ))}
              <tr className="border-b border-border/60">
                <td className="p-4 text-muted-foreground">Contact owner</td>
                {selected.map((l, i) => (
                  <td key={i} className="p-3">
                    {l.whatsapp ? (
                      <WhatsAppContact whatsapp={l.whatsapp} listingName={l.name} className="text-xs px-3 py-2 w-full" label="WhatsApp" />
                    ) : (
                      <span className="text-xs text-muted-foreground">Via DUNest</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-navy text-white rounded-2xl p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Sparkles size={18} className="text-brand-green" /> DUNest recommends
          </h3>
          <p className="mt-2 text-white/80">
            Based on full monthly cost, <strong className="text-brand-green">{cheapest.name}</strong>{" "}
            ({cheapest.type}) gives you the best value at{" "}
            <strong>₹{totals[minIdx].toLocaleString("en-IN")}/month</strong>.{" "}
            {cheapest.type === "Flat"
              ? "You'll have your own kitchen and no curfew, but you'll need to find flatmates."
              : "Meals, security and zero maintenance are bundled in — great for first-years."}
          </p>
        </div>

        {/* Lifestyle */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Lifestyle
            title="PG lifestyle"
            pros={["Meals included", "Zero maintenance", "Security on site", "Structured living"]}
            cons={["Curfew", "House rules", "Less freedom", "Shared spaces"]}
          />
          <Lifestyle
            title="Flat lifestyle"
            pros={["No curfew", "Own kitchen", "More freedom", "Cook your preference"]}
            cons={["Manage everything", "Find flatmates", "Handle utility bills", "Furnishing cost"]}
          />
        </div>

        {/* Delhi utilities */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold">Delhi utilities — what to budget</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ["Electricity", "BSES / Tata Power", "₹400–900/person/mo (AC raises it)"],
              ["Water", "DJB", "₹100–200/person/mo"],
              ["Laundry", "Local dhobi", "₹350–550/mo · ₹12–15 per piece"],
              ["Internet", "Jio Fiber / ACT", "₹300–500/mo shared"],
              ["Cook", "Part-time", "₹2,000–3,500/mo for group"],
              ["Maid", "Daily cleaning", "₹1,000–1,500/mo shared"],
            ].map(([k, src, val]) => (
              <div key={k} className="bg-white border border-border rounded-xl p-4">
                <div className="font-semibold">{k}</div>
                <div className="text-xs text-muted-foreground">{src}</div>
                <div className="text-sm mt-2">{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Lifestyle({
  title,
  pros,
  cons,
}: {
  title: string;
  pros: string[];
  cons: string[];
}) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <h4 className="font-bold text-lg mb-3">{title}</h4>
      <div className="space-y-2">
        {pros.map((p) => (
          <div key={p} className="flex items-start gap-2 text-sm">
            <CheckCircle2 size={16} className="text-brand-green flex-shrink-0 mt-0.5" />
            <span>{p}</span>
          </div>
        ))}
        {cons.map((c) => (
          <div key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
            <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <span>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
