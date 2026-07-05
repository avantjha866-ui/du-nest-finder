import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { z } from "zod";
import { COLLEGES, type Listing } from "@/lib/data";
import { ListingCard } from "@/components/ListingCard";
import { useCompareList } from "@/lib/store";
import { MapPin, Tag } from "lucide-react";
import { getApprovedListings } from "@/lib/listings.functions";

const listingsQueryOptions = queryOptions({
  queryKey: ["approved-listings"],
  queryFn: () => getApprovedListings(),
});

function ListingsError({ error }: { error: Error }) {
  return <div role="alert" className="p-8 text-center text-destructive">{error.message}</div>;
}

function ListingsNotFound() {
  return <div className="p-8 text-center text-muted-foreground">No listings found.</div>;
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
      {
        name: "description",
        content: "Browse verified PGs and flats near Delhi University colleges — filtered by your budget.",
      },
    ],
  }),
  errorComponent: ListingsError,
  notFoundComponent: ListingsNotFound,
  component: ListingsPage,
});

/** How many of a listing's room-types (or per-person splits) fit the student's budget. */
function budgetMatches(l: Listing, budget: number) {
  if (!budget || budget <= 0) return { total: 0, fits: 0, options: [] as { label: string; price: number; fits: boolean }[] };

  const options: { label: string; price: number; fits: boolean }[] = [];
  if (l.type === "PG") {
    if (l.roomPrices?.single) options.push({ label: "Single", price: l.roomPrices.single, fits: l.roomPrices.single <= budget });
    if (l.roomPrices?.double) options.push({ label: "Double sharing", price: l.roomPrices.double, fits: l.roomPrices.double <= budget });
    if (l.roomPrices?.triple) options.push({ label: "Triple sharing", price: l.roomPrices.triple, fits: l.roomPrices.triple <= budget });
  } else {
    if (l.perPerson?.two) options.push({ label: "2 sharing", price: l.perPerson.two, fits: l.perPerson.two <= budget });
    if (l.perPerson?.three) options.push({ label: "3 sharing", price: l.perPerson.three, fits: l.perPerson.three <= budget });
    if (l.perPerson?.four) options.push({ label: "4 sharing", price: l.perPerson.four, fits: l.perPerson.four <= budget });
  }
  return {
    total: options.length,
    fits: options.filter((o) => o.fits).length,
    options,
  };
}

function ListingsPage() {
  const { data: listings } = useSuspenseQuery(listingsQueryOptions);
  const search = Route.useSearch();
  const college = search.college != null ? String(search.college) : undefined;
  const type = search.type != null ? String(search.type) : undefined;
  const budgetParam = search.budget != null ? Number(search.budget) : 0;
  const genderParam = search.gender != null ? String(search.gender) : "Any";
  const { ids } = useCompareList();

  const [activeTab, setActiveTab] = useState<"All" | "PG" | "Flat">(
    type === "PG only" ? "PG" : type === "Flat only" ? "Flat" : "All",
  );
  const [collegeFilter, setCollegeFilter] = useState<string>(college ?? "All colleges");
  const [budget, setBudget] = useState<number>(budgetParam || 0);
  const [genderFilter, setGenderFilter] = useState<string>(genderParam || "Any");

  const filtered = useMemo(() => {
    const rows = listings
      .filter((l) => {
        if (activeTab !== "All" && l.type !== activeTab) return false;
        if (collegeFilter !== "All colleges" && l.college !== collegeFilter) return false;
        if (genderFilter !== "Any" && l.gender !== genderFilter) return false;
        return true;
      })
      .map((l) => ({ listing: l, match: budgetMatches(l, budget) }));

    // If a budget is set, keep only listings with at least one option in budget
    const withBudget = budget > 0 ? rows.filter((r) => r.match.fits > 0 || r.match.total === 0) : rows;

    // Sort: featured first, then more budget-fits first, then walk time
    return withBudget.sort((a, b) => {
      const fa = a.listing.featured ? 1 : 0;
      const fb = b.listing.featured ? 1 : 0;
      if (fa !== fb) return fb - fa;
      if (budget > 0 && a.match.fits !== b.match.fits) return b.match.fits - a.match.fits;
      return (a.listing.walkMinutes ?? 999) - (b.listing.walkMinutes ?? 999);
    });
  }, [activeTab, collegeFilter, genderFilter, budget, listings]);

  const empty = filtered.length === 0;
  const collegeName = collegeFilter === "All colleges" ? "DU" : collegeFilter;

  return (
    <div className="bg-navy-soft min-h-screen">
      <div className="bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-tagline">
                PGs & Flats near {collegeName}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-brand-orange" />
                  <strong className="text-foreground">{filtered.length}</strong> listings
                </span>
                {budget > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Tag size={14} className="text-brand-orange" />
                    Within budget <strong className="text-foreground">₹{budget.toLocaleString("en-IN")}</strong>
                  </span>
                )}
              </div>
            </div>
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-navy-light transition-colors text-sm"
            >
              Compare ({ids.length})
            </Link>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-3 flex-wrap">
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="bg-secondary border border-border rounded-xl px-4 py-2 text-sm font-medium"
            >
              <option>All colleges</option>
              {COLLEGES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <div className="inline-flex bg-secondary rounded-xl p-1">
              {(["All", "PG", "Flat"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === t ? "bg-white shadow-sm text-navy" : "text-muted-foreground"
                  }`}
                >
                  {t === "All" ? "All" : t === "PG" ? "PGs only" : "Flats only"}
                </button>
              ))}
            </div>
            <select
              value={String(budget)}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="bg-secondary border border-border rounded-xl px-4 py-2 text-sm font-medium"
            >
              <option value="0">Any budget</option>
              <option value="5000">Under ₹5,000</option>
              <option value="7000">Under ₹7,000</option>
              <option value="9000">Under ₹9,000</option>
              <option value="12000">Under ₹12,000</option>
              <option value="99999">₹12,000+</option>
            </select>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="bg-secondary border border-border rounded-xl px-4 py-2 text-sm font-medium"
            >
              <option>Any</option>
              <option>Girls only</option>
              <option>Boys only</option>
              <option>Co-ed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {empty ? (
          <EmptyState collegeName={collegeName} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map(({ listing, match }) => (
              <div key={listing.id} className="relative">
                {budget > 0 && match.total > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2 items-center">
                    {match.fits > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-md">
                        ✅ {match.fits} option{match.fits > 1 ? "s" : ""} within your budget
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-md">
                        Over your budget
                      </span>
                    )}
                    {match.options.map((o) => (
                      <span
                        key={o.label}
                        className={`text-[10px] px-2 py-1 rounded-md border ${
                          o.fits
                            ? "bg-white text-green-700 border-green-200"
                            : "bg-white text-muted-foreground border-border"
                        }`}
                      >
                        {o.label} ₹{o.price.toLocaleString("en-IN")} {o.fits ? "✓" : "✗"}
                      </span>
                    ))}
                  </div>
                )}
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ collegeName }: { collegeName: string }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-12 text-center max-w-2xl mx-auto">
      <h2 className="text-2xl font-tagline">No listings yet near {collegeName}.</h2>
      <p className="mt-3 text-muted-foreground">
        We're actively onboarding PG owners in this area. Check back soon — or if you own a property here, list it and reach students today.
      </p>
      <Link
        to="/submit"
        className="mt-6 inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        List Your Property
      </Link>
    </div>
  );
}
