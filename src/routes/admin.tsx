import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminLogin, adminLogout, adminStatus } from "@/lib/admin.functions";
import { AdminAuthContext } from "@/lib/adminAuth";
import { Lock, LayoutDashboard, PlusCircle, LogOut } from "lucide-react";
import { toast } from "sonner";

export { useAdminAuth } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — DUNest" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pwd, setPwd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    adminStatus()
      .then((r) => {
        setAuthed(r.authed);
        if (r.authed) navigate({ to: "/admin/review" });
      })
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="bg-navy-soft min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Checking session…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="bg-navy-soft min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (submitting) return;
            setSubmitting(true);
            try {
              const res = await adminLogin({ data: { password: pwd } });
              if (res.ok) {
                setAuthed(true);
                setPwd("");
                toast.success("Welcome back");
                navigate({ to: "/admin/review" });
              } else {
                toast.error("Wrong password");
              }
            } catch {
              toast.error("Login unavailable. Try again.");
            } finally {
              setSubmitting(false);
            }
          }}
          className="bg-white border border-border rounded-2xl p-8 max-w-md w-full shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center mb-4">
            <Lock size={20} />
          </div>
          <h1 className="text-2xl font-bold">Admin access</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter the admin password to manage listings.</p>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="mt-5 w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 w-full bg-brand-green hover:bg-brand-green-dark text-white font-semibold py-3 rounded-xl disabled:opacity-60"
          >
            {submitting ? "Unlocking…" : "Unlock admin"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider
      value={{
        logout: async () => {
          try { await adminLogout(); } catch { /* ignore */ }
          setAuthed(false);
        },
      }}
    >
      {/* Admin-only top bar */}
      <div className="bg-white border-b border-border sticky top-16 z-40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-4">
              Admin Panel
            </span>
            <Link
              to="/admin/review"
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors"
              activeProps={{ className: "flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-secondary text-navy" }}
            >
              <LayoutDashboard size={14} /> Dashboard
            </Link>
            <a
              href="/admin/"
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <PlusCircle size={14} /> Add Listing
            </a>
          </div>
          <button
            onClick={async () => {
              try { await adminLogout(); } catch { /* ignore */ }
              setAuthed(false);
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </div>
      <Outlet />
    </AdminAuthContext.Provider>
  );
}
