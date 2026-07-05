import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAllListings, updateListingStatus, deleteListing } from "@/lib/admin.functions";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/adminAuth";
import { CheckCircle2, XCircle, Trash2, Clock, RefreshCw, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin/review")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — HomeWise" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminDashboard,
});

type ListingRow = Awaited<ReturnType<typeof getAllListings>>[number];
type Tab = "all" | "pending" | "approved" | "rejected";

function AdminDashboard() {
  const { logout } = useAdminAuth();
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");

  const load = () => {
    setLoading(true);
    getAllListings()
      .then((rows) => setListings(rows as ListingRow[]))
      .catch((err) => toast.error(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const counts = {
    all: listings.length,
    pending: listings.filter((l) => l.status === "pending").length,
    approved: listings.filter((l) => l.status === "approved").length,
    rejected: listings.filter((l) => l.status === "rejected").length,
  };

  const filtered = tab === "all" ? listings : listings.filter((l) => l.status === tab);

  const onStatusChange = (id: string, status: "approved" | "rejected") => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const onDelete = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="bg-navy-soft min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review, approve and manage all HomeWise listings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 text-sm border border-border bg-white px-3 py-2 rounded-lg hover:bg-secondary"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                tab === t.key
                  ? "bg-brand-orange text-white border-brand-orange"
                  : "bg-white text-foreground border-border hover:border-brand-orange/40"
              }`}
            >
              {t.label}
              <span className="ml-2 text-xs opacity-75">({counts[t.key]})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white border border-border rounded-2xl p-12 text-center text-muted-foreground">
            Loading listings…
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-12 text-center text-muted-foreground">
            No {tab === "all" ? "" : tab} listings.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((l) => (
              <ListingRowCard
                key={l.id}
                listing={l}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ListingRowCard({
  listing,
  onStatusChange,
  onDelete,
}: {
  listing: ListingRow;
  onStatusChange: (id: string, status: "approved" | "rejected") => void;
  onDelete: (id: string) => void;
}) {
  const [working, setWorking] = useState<null | "approved" | "rejected" | "delete">(null);

  const handleStatus = async (status: "approved" | "rejected") => {
    setWorking(status);
    try {
      await updateListingStatus({ data: { id: listing.id, status } });
      toast.success(`Listing ${status}`);
      onStatusChange(listing.id, status);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setWorking(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${listing.name || "this listing"}"? This cannot be undone.`)) return;
    setWorking("delete");
    try {
      await deleteListing({ data: { id: listing.id } });
      toast.success("Listing deleted");
      onDelete(listing.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setWorking(null);
    }
  };

  const statusBadge: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-600 border-red-200",
  };

  const dateStr = listing.created_at
    ? new Date(listing.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const kv = (label: string, value: string | number | null | undefined) =>
    value !== null && value !== undefined && String(value).trim() !== "" ? (
      <div key={label}>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </span>
        <p className="text-sm font-medium mt-0.5">{String(value)}</p>
      </div>
    ) : null;

  const prices: string[] = [];
  if (listing.price_single) prices.push(`Single ₹${listing.price_single.toLocaleString("en-IN")}`);
  if (listing.price_double) prices.push(`Double ₹${listing.price_double.toLocaleString("en-IN")}`);
  if (listing.price_triple) prices.push(`Triple ₹${listing.price_triple.toLocaleString("en-IN")}`);
  if (listing.total_rent) prices.push(`Total ₹${listing.total_rent.toLocaleString("en-IN")}`);

  return (
    <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-navy text-white px-2 py-1 rounded-md">
              {(listing.type ?? "LISTING").toUpperCase()}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                statusBadge[listing.status] ?? ""
              }`}
            >
              {listing.status}
            </span>
            {listing.is_featured && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-gold text-white px-2 py-1 rounded-md">
                ⭐ Featured
              </span>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock size={11} /> {dateStr}
            </span>
          </div>
          <h3 className="text-lg font-bold mt-2">{listing.name || "Unnamed listing"}</h3>
          <p className="text-sm text-muted-foreground">
            {listing.locality}
            {listing.college ? ` · ${listing.college}` : ""}
          </p>
          {prices.length > 0 && (
            <p className="text-sm text-brand-orange font-semibold mt-1">{prices.join(" · ")}</p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
        {kv("Gender", listing.gender)}
        {kv("Curfew", listing.curfew)}
        {kv("AC", listing.ac)}
        {kv("Walk (min)", listing.walk_min)}
        {kv("Ideal sharers", listing.ideal_sharers)}
        {kv("Metro", listing.metro_station)}
        {kv("Food", listing.food_type)}
        {kv("WiFi", listing.wifi)}
        {kv("Deposit (₹)", listing.deposit)}
      </div>

      {(listing.owner_name || listing.owner_whatsapp || listing.owner_email) && (
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
          {kv("Owner", listing.owner_name)}
          {kv("WhatsApp", listing.owner_whatsapp)}
          {kv("Email", listing.owner_email)}
          {kv("Area notes", listing.area_description)}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-border">
        {listing.status !== "approved" && (
          <button
            onClick={() => handleStatus("approved")}
            disabled={!!working}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-60"
          >
            <CheckCircle2 size={15} />
            {working === "approved" ? "Approving…" : "Approve"}
          </button>
        )}
        {listing.status !== "rejected" && (
          <button
            onClick={() => handleStatus("rejected")}
            disabled={!!working}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-60"
          >
            <XCircle size={15} />
            {working === "rejected" ? "Rejecting…" : "Reject"}
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={!!working}
          className="flex items-center gap-1.5 border border-border text-muted-foreground hover:text-red-500 hover:border-red-300 font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-60 ml-auto"
        >
          <Trash2 size={14} />
          {working === "delete" ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
