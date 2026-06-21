import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { z } from "zod";
import { FILTER_CHIPS, type FilterChip, COLLEGES } from "@/lib/data";
import { ListingCard } from "@/components/ListingCard";
import { useCompareList } from "@/lib/store";
import { Clock, Tag, MapPin } from "lucide-react";
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
});

export const Route = createFileRoute("/listings")({
  validateSearch: searchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(listingsQueryOptions),
  head: () => ({
    meta: [
      { title: "Listings — DUNest" },
      {
        name: "description",
        content: "Browse verified PGs and flats near Delhi University colleges.",
      },
    ],
  }),
  errorComponent: ListingsError,
  notFoundComponent: ListingsNotFound,
  component: ListingsPage,
});

function ListingsPage() {
  const { data: listings } = useSuspenseQuery(listingsQueryOptions);
  const search = Route.useSearch();
  const college = search.college != null ? String(search.college) : undefined;
  const type = search.type != null ? String(search.type) : undefined;
  const { ids } = useCompareList();

  const [activeTab, setActiveTab] = useState<"All" | "PG" | "Flat">(
    type === "PG only" ? "PG" : type === "Flat only" ? "Flat" : "All",
  );
  const [chips, setChips] = useState<Set<FilterChip>>(new Set());
  const [collegeFilter, setCollegeFilter] = useState<string>(college ?? "All colleges");
  const [budgetFilter, setBudgetFilter] = useState<string>("");

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (activeTab !== "All" && l.type !== activeTab) return false;
      if (collegeFilter !== "All colleges" && l.college !== collegeFilter) return false;
      if (budgetFilter && Number(budgetFilter) > 0) {
        const effectiveRent = l.type === "Flat" ? Math.round(l.rent / (l.idealSharers ?? 3)) : l.rent;
        if (effectiveRent > Number(budgetFilter)) return false;
      }
      for (const chip of chips) {
        switch (chip) {
          case "Food included": if (l.food !== "Included") return false; break;
          case "Girls only": if (l.gender !== "Girls only") return false; break;
          case "Boys only": if (l.gender !== "Boys only") return false; break;
          case "AC room": if (!l.ac) return false; break;
          case "Gym nearby": if (!l.amenities.gym) return false; break;
          case "Negotiable rent": if (l.negotiable === "No") return false; break;
          case "No curfew": if (l.curfew !== "None") return false; break;
          case "Under ₹6000": if (l.rent >= 6000) return false; break;
          case "Under ₹8000": if (l.rent >= 8000) return false; break;
          case "Under ₹10000": if (l.rent >= 10000) return false; break;
          case "Under ₹12000": if (l.rent >= 12000) return false; break;
        }
      }
      return true;
    });
  }, [activeTab, chips, collegeFilter, budgetFilter, listings]);

  const lowest = filtered.reduce(
    (m, l) => (l.rent < m ? l.rent : m),
    filtered[0]?.rent ?? 0,
  );
  const nearest = filtered.reduce(
    (m, l) => (l.walkMinutes < m ? l.walkMinutes : m),
    filtered[0]?.walkMinutes ?? 0,
  );

  const toggleChip = (c: FilterChip) => {
    setChips((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  return (
    <div className="bg-navy-soft min-h-screen">
      {/* Top bar */}
      <div className="bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                PGs & Flats near {collegeFilter === "All colleges" ? "DU" : collegeFilter}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-brand-green" />
                  <strong className="text-foreground">{filtered.length}</strong> listings found
                </span>
                {filtered.length > 0 && (
                  <>
                    <span className="flex items-center gap-1.5">
                      <Tag size={14} className="text-brand-green" />
                      Lowest <strong className="text-foreground">₹{lowest.toLocaleString("en-IN")}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-brand-green" />
                      Nearest <strong className="text-foreground">{nearest} min walk</strong>
                    </span>
                  </>
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

          {/* College + tabs + budget */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3 flex-wrap">
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="bg-secondary border border-border rounded-xl px-4 py-2 text-sm font-medium"
            >
              <option>All colleges</option>
              {COLLEGES.map((c) => (
                <option key={c}>{c}</option>
              ))}
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
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
              <input
                type="number"
                placeholder="Max budget"
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
                className="bg-secondary border border-border rounded-xl pl-7 pr-4 py-2 text-sm w-36"
              />
            </div>
          </div>

          {/* Chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {FILTER_CHIPS.map((c) => {
              const active = chips.has(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleChip(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    active
                      ? "bg-brand-green text-white border-brand-green"
                      : "bg-white text-foreground border-border hover:border-brand-green/40"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">
              {listings.length === 0
                ? "No approved listings are live yet."
                : "No listings match these filters. Try removing some chips."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
