import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { z } from "zod";
import { COLLEGES, type Listing } from "@/lib/data";
import { ListingGridCard } from "@/components/ListingGridCard";
import { useCompareList } from "@/lib/store";
import { Home, SlidersHorizontal, X } from "lucide-react";
import { getApprovedListings } from "@/lib/listings.functions";

const listingsQueryOptions = queryOptions({
  queryKey: ["approved-listings"],
  queryFn: () => getApprovedListings(),
  staleTime: 5 * 60 * 1000,
});

function ListingsError({ error }: { error: Error }) {
  return (
    <div role="alert" className="min-h-[50vh] flex items-center justify-center bg-navy text-brand-cream p-8">
      <div className="text-center max-w-md">
        <h2 className="font-tagline text-2xl">Could not load listings.</h2>
        <p className="mt-2 text-brand-cream/70">Please check your connection and try again.</p>
        <p className="mt-4 text-xs text-brand-cream/40">{error.message}</p>
        <button onClick={() => window.location.reload()} className="mt-6 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-6 py-3 rounded-xl">
          Retry
        </button>
      </div>
    </div>
  );
}

const searchSchema = z.object({
  college: z.any().optional(),
  type: z.any().optional(),
  distance: z.any().optional(),
  budget: z.any().optional(),
  gender: z.any().optional(),
});

export const Route = createFileRoute("/listings")({
  validateSearch: searchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(listingsQueryOptions),
  head: () => ({
    meta: [
      { title: "Listings — HomeWise" },
      { name: "description", content: "Verified PGs and flats near Delhi University colleges. Filter by budget, gender, and distance." },
      { property: "og:title", content: "Verified PGs & Flats near DU — HomeWise" },
      { property: "og:description", content: "Browse student-vetted PGs and flats near your Delhi University college." },
    ],
  }),
  errorComponent: ListingsError,
  component: ListingsPage,
});

function budgetMatches(l: Listing, budget: number) {
  if (!budget || budget <= 0) return { total: 0, fits: 0 };
  const options: number[] = [];
  if (l.type === "PG") {
    if (l.roomPrices?.single) options.push(l.roomPrices.single);
    if (l.roomPrices?.double) options.push(l.roomPrices.double);
    if (l.roomPrices?.triple) options.push(l.roomPrices.triple);
  } else {
    if (l.perPerson?.two) options.push(l.perPerson.two);
    if (l.perPerson?.three) options.push(l.perPerson.three);
    if (l.perPerson?.four) options.push(l.perPerson.four);
  }
  return { total: options.length, fits: options.filter((p) => p <= budget).length };
}

function ListingsPage() {
  const { data: listings } = useSuspenseQuery(listingsQueryOptions);
  const search = Route.useSearch();
  const college = search.college != null ? String(search.college) : undefined;
  const type = search.type != null ? String(search.type) : undefined;
  const budgetParam = search.budget != null ? Number(search.budget) : 0;
  const genderParam = search.gender != null ? String(search.gender) : "Any";
  const distanceParam = search.distance != null ? String(search.distance) : "";
  const { ids } = useCompareList();

  const [activeTab, setActiveTab] = useState<"All" | "PG" | "Flat">(
    type === "PG only" ? "PG" : type === "Flat only" ? "Flat" : "All",
  );
  const [collegeFilter, setCollegeFilter] = useState<string>(college ?? "All colleges");
  const [budget, setBudget] = useState<number>(budgetParam || 0);
  const [genderFilter, setGenderFilter] = useState<string>(genderParam || "Any");
  const [visible, setVisible] = useState(12);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const rows = listings
      .filter((l) => {
        if (activeTab !== "All" && l.type !== activeTab) return false;
        if (collegeFilter !== "All colleges") {
          const nearby = l.colleges && l.colleges.length > 0 ? l.colleges : [l.college];
          if (!nearby.includes(collegeFilter)) return false;
        }
        if (genderFilter !== "Any" && l.gender !== genderFilter) return false;
        return true;
      })
      .map((l) => ({ listing: l, match: budgetMatches(l, budget) }));

    const withBudget = budget > 0 ? rows.filter((r) => r.match.fits > 0 || r.match.total === 0) : rows;

    return withBudget.sort((a, b) => {
      const fa = a.listing.featured ? 1 : 0;
      const fb = b.listing.featured ? 1 : 0;
      if (fa !== fb) return fb - fa;
      if (budget > 0 && a.match.fits !== b.match.fits) return b.match.fits - a.match.fits;
      return (a.listing.walkMinutes ?? 999) - (b.listing.walkMinutes ?? 999);
    });
  }, [activeTab, collegeFilter, genderFilter, budget, listings]);


  const empty = filtered.length === 0;
  const collegeName = collegeFilter === "All colleges" ? "DU colleges" : collegeFilter;
  const distanceLabel = distanceParam ? ` · ${distanceParam}` : "";
  const budgetLabel = budget > 0 ? ` · Under ₹${budget.toLocaleString("en-IN")}` : "";
  const shown = filtered.slice(0, visible);

  return (
    <div className="min-h-screen bg-navy">
      {/* Sticky search bar */}
      <div className="sticky top-0 z-30 backdrop-blur-md border-b" style={{ backgroundColor: "rgba(15,32,53,0.92)", borderColor: "rgba(232,220,200,0.08)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <nav className="flex items-center gap-2 text-xs text-brand-cream/50 min-w-0">
              <Link to="/" className="hover:text-brand-cream transition-colors">Home</Link>
              <span className="text-brand-orange">›</span>
              <span className="text-brand-orange truncate">Listings near {collegeName}</span>
            </nav>
            <div className="flex items-center gap-2">
              <Link to="/compare" className="text-xs font-bold text-brand-cream/80 hover:text-brand-orange transition-colors">
                Compare ({ids.length})
              </Link>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-brand-cream text-sm sm:text-base font-medium min-w-0">
              <span className="font-tagline text-brand-cream">PGs & Flats near {collegeName}</span>
              <span className="text-brand-cream/60">{distanceLabel}{budgetLabel}</span>
            </p>
            <button
              onClick={() => setFiltersOpen(v => !v)}
              className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
            >
              {filtersOpen ? <X size={16} /> : <SlidersHorizontal size={16} />}
              {filtersOpen ? "Close" : "Edit search"}
            </button>
          </div>

          {filtersOpen && (
            <div className="mt-3 pt-3 border-t border-brand-cream/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <select value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value)}
                className="bg-navy border border-brand-cream/15 rounded-lg px-3 py-2 text-sm text-brand-cream">
                <option>All colleges</option>
                {COLLEGES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <div className="inline-flex bg-navy border border-brand-cream/15 rounded-lg p-1">
                {(["All", "PG", "Flat"] as const).map((t) => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === t ? "bg-brand-orange text-white" : "text-brand-cream/70"}`}>
                    {t === "All" ? "All" : t === "PG" ? "PGs" : "Flats"}
                  </button>
                ))}
              </div>
              <select value={String(budget)} onChange={(e) => setBudget(Number(e.target.value))}
                className="bg-navy border border-brand-cream/15 rounded-lg px-3 py-2 text-sm text-brand-cream">
                <option value="0">Any budget</option>
                <option value="5000">Under ₹5,000</option>
                <option value="7000">Under ₹7,000</option>
                <option value="9000">Under ₹9,000</option>
                <option value="12000">Under ₹12,000</option>
                <option value="99999">₹12,000+</option>
              </select>
              <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}
                className="bg-navy border border-brand-cream/15 rounded-lg px-3 py-2 text-sm text-brand-cream">
                <option>Any</option>
                <option>Girls only</option>
                <option>Boys only</option>
                <option>Co-ed</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <p className="text-brand-cream/80 text-sm mb-5">
          <strong className="text-brand-orange">{filtered.length}</strong> verified listing{filtered.length === 1 ? "" : "s"} found
        </p>

        {empty ? (
          <EmptyState collegeName={collegeName} />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {shown.map(({ listing }) => (
                <ListingGridCard
                  key={listing.id}
                  listing={listing}
                  budget={budget}
                />
              ))}
            </div>
            {visible < filtered.length && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setVisible((v) => v + 12)}
                  className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-8 py-3 rounded-xl transition-colors"
                >
                  Load more ({filtered.length - visible} more)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ collegeName }: { collegeName: string }) {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-20 h-20 rounded-2xl bg-brand-orange/10 flex items-center justify-center mx-auto">
        <Home size={40} className="text-brand-orange" />
      </div>
      <h2 className="mt-6 font-tagline text-xl text-brand-cream">No listings found near {collegeName}</h2>
      <p className="mt-2 text-sm text-brand-cream/60 leading-relaxed">
        We're onboarding PG owners in this area right now. Check back in a few days or help us by sharing HomeWise with owners near your college.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/submit" className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-6 py-3 rounded-xl">
          List a Property
        </Link>
      </div>
    </div>
  );
}
