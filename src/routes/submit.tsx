import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "List your property — HomeWise" },
      { name: "description", content: "PG and flat owners: list your property on HomeWise and reach thousands of DU students." },
    ],
  }),
  component: SubmitPage,
});

function SubmitPage() {
  return (
    <div className="bg-navy-soft min-h-[calc(100vh-4rem)] py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-border rounded-2xl p-8 sm:p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-accent text-brand-orange-dark flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="text-3xl font-bold">List your property on HomeWise</h1>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
          Free. Verified. Reach thousands of DU students actively searching for housing.
          The owner portal is launching shortly — meanwhile, tell us about your property
          and we'll onboard you personally.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href="https://wa.me/919999999999?text=Hi%20HomeWise%20team%2C%20I%27d%20like%20to%20list%20my%20property."
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            WhatsApp us to list
          </a>
          <Link
            to="/listings"
            className="inline-flex items-center gap-2 border border-border text-foreground font-semibold px-6 py-3 rounded-xl hover:bg-secondary"
          >
            Browse existing listings
          </Link>
        </div>
      </div>
    </div>
  );
}
