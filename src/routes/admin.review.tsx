import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAllListings, updateListingStatus, deleteListing } from "@/lib/admin.functions";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/adminAuth";
import { CheckCircle2, XCircle, Trash2, Clock, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/review")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — DUNest" }, { name: "robots", content: "noindex" }],
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
      .then(setListings)
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

  const TABS: { key: Tab; label: string; color: string }[] = [
    { key: "pending", label: "Pending", color: "text-amber-600" },
    { key: "approved", label: "Approved", color: "text-green-600" },
    { key: "rejected", label: "Rejected", color: "text-red-500" },
    { key: "all", label: "All", color: "text-foreground" },
  ];

  return (
    <div className="bg-navy-soft min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Review, approve and manage all listings.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2"
            >
              <RefreshCw size={13} /> Refresh
            </button>
            <button onClick={logout} className="text-xs text-muted-foreground underline">
              Sign out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {TABS.map(({ key, label, color }) => (
            <div key={key} className="bg-white border border-border rounded-xl px-4 py-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${color}`}>{counts[key]}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-border rounded-xl p-1 mb-6 w-fit">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === key ? "bg-navy text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {counts[key] > 0 && (
                <span className={`ml-1.5 text-xs ${tab === key ? "text-white/70" : "text-muted-foreground"}`}>
                  ({counts[key]})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && <p className="text-sm text-muted-foreground">Loading listings…</p>}

        {!loading && filtered.length === 0 && (
          <div className="bg-white border border-border rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">No {tab === "all" ? "" : tab} listings found.</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
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

function ListingCard({
  listing,
  onStatusChange,
  onDelete,
}: {
  listing: ListingRow;
  onStatusChange: (id: string, status: "approved" | "rejected") => void;
  onDelete: (id: string) => void;
}) {
  const [working, setWorking] = useState<string | null>(null);

  const handleStatus = async (status: "approved" | "rejected") => {
    setWorking(status);
    try {
      await updateListingStatus({ data: { id: listing.id, status } });
      toast.success(status === "approved" ? "✓ Listing approved" : "✗ Listing rejected");
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
        day: "numeric", month: "short", year: "numeric",
      })
    : "";

  const kv = (label: string, value: string | number | null | undefined) =>
    value !== null && value !== undefined && String(value).trim() !== "" ? (
      <div key={label}>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
        <p className="text-sm font-medium mt-0.5">{String(value)}</p>
      </div>
    ) : null;

  return (
    <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-navy text-white px-2 py-1 rounded-md">
              {listing.type ?? "LISTING"}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${statusBadge[listing.status] ?? ""}`}>
              {listing.status}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock size={11} /> {dateStr}
            </span>
          </div>
          <h3 className="text-lg font-bold mt-2">{listing.name || "Unnamed listing"}</h3>
          <p className="text-sm text-muted-foreground">
            {listing.locality}{listing.college ? ` · ${listing.college}` : ""}
            {listing.rent ? ` · ₹${listing.rent.toLocaleString()}` : ""}
          </p>
        </div>
      </div>

      {/* Details grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
        {kv("Gender", listing.gender)}
        {kv("Curfew", listing.curfew)}
        {kv("AC", listing.ac)}
        {kv("Walk (min)", listing.walk_min)}
        {kv("Sharers", listing.sharers)}
        {kv("Metro", listing.metro_station)}
        {kv("Food", listing.food_type)}
        {kv("WiFi", listing.wifi)}
        {kv("Deposit (₹)", listing.deposit)}
      </div>

      {/* Contact — always visible for admin */}
      {(listing.owner_name || listing.whatsapp) && (
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
          {kv("Owner", listing.owner_name)}
          {kv("WhatsApp", listing.whatsapp)}
          {kv("Notes", listing.notes)}
        </div>
      )}

      {/* Actions */}
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
        {listing.status === "approved" && (
          <button
            onClick={() => handleStatus("rejected")}
            disabled={!!working}
            className="flex items-center gap-1.5 border border-red-300 text-red-500 hover:bg-red-50 font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-60"
          >
            <XCircle size={15} />
            {working === "rejected" ? "Revoking…" : "Revoke approval"}
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
