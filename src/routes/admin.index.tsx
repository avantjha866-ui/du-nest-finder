import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard, PlusCircle } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Admin — HomeWise" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminHome,
});

function AdminHome() {
  return (
    <div className="bg-navy-soft min-h-[calc(100vh-4rem)] px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">HomeWise Admin</h1>
        <p className="mt-2 text-muted-foreground">
          Review pending listings and manage the queue.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            to="/admin/review"
            className="bg-white border border-border rounded-2xl p-6 hover:border-brand-orange/40 transition-colors flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-accent text-brand-orange-dark flex items-center justify-center">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Review listings</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Approve, reject and manage all listings.
              </p>
            </div>
          </Link>
          <div className="bg-white border border-border rounded-2xl p-6 opacity-60 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-secondary text-muted-foreground flex items-center justify-center">
              <PlusCircle size={22} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Owner portal</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Coming soon — owners will self-serve their listings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
