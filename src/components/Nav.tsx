import { Link } from "@tanstack/react-router";
import { useCompareList } from "@/lib/store";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Nav() {
  const { ids } = useCompareList();
  const [open, setOpen] = useState(false);

  const linkClass = "text-sm font-medium text-white/80 hover:text-white transition-colors";
  const activeProps = { className: "text-sm font-medium text-white" };

  return (
    <header className="sticky top-0 z-50 bg-navy/95 backdrop-blur border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex flex-col leading-none">
          <span className="flex items-baseline text-2xl font-tagline">
            <span className="text-brand-orange">Home</span>
            <span className="text-brand-cream">Wise</span>
          </span>
          <span
            className="mt-1 text-brand-cream font-semibold"
            style={{ fontSize: "10px", letterSpacing: "3px" }}
          >
            RIGHT PLACE. RIGHT START.
          </span>
        </Link>


        <nav className="hidden md:flex items-center gap-8">
          <Link to="/listings" className={linkClass} activeProps={activeProps}>
            Listings
          </Link>
          <Link to="/compare" className={linkClass} activeProps={activeProps}>
            Compare
            {ids.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-brand-orange text-white text-[10px] font-bold w-5 h-5">
                {ids.length}
              </span>
            )}
          </Link>
          <Link
            to="/submit"
            className="text-sm font-semibold bg-brand-orange hover:bg-brand-orange-dark text-white px-4 py-2 rounded-lg transition-colors"
          >
            List Your Property
          </Link>
        </nav>

        <button
          aria-label="Toggle menu"
          className="md:hidden text-white p-2"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-navy">
          <div className="px-4 py-3 flex flex-col gap-3">
            <Link to="/listings" className="text-white/90 py-1" onClick={() => setOpen(false)}>
              Listings
            </Link>
            <Link to="/compare" className="text-white/90 py-1" onClick={() => setOpen(false)}>
              Compare {ids.length > 0 && `(${ids.length})`}
            </Link>
            <Link to="/submit" className="text-white/90 py-1 font-semibold" onClick={() => setOpen(false)}>
              List Your Property
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy-dark text-brand-cream/60 mt-20 border-t" style={{ borderTopColor: "rgba(217,79,43,0.3)" }}>
      <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row gap-8 justify-between">
        <div>
          <div className="text-xl font-tagline flex items-baseline">
            <span className="text-brand-orange">Home</span>
            <span className="text-brand-cream">Wise</span>
          </div>
          <p className="text-brand-cream/60 mt-1 font-semibold" style={{ fontSize: "10px", letterSpacing: "3px" }}>
            RIGHT PLACE. RIGHT START.
          </p>
          <p className="text-sm mt-4 max-w-sm">
            Built for Delhi University students. Every listing verified before it goes live.
          </p>
        </div>
        <div className="flex gap-12">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-brand-orange mb-3">Students</div>
            <div className="flex flex-col gap-2">
              <Link to="/listings" className="text-sm hover:text-brand-orange transition-colors">Browse listings</Link>
              <Link to="/compare" className="text-sm hover:text-brand-orange transition-colors">Compare PG vs Flat</Link>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-brand-orange mb-3">Owners</div>
            <div className="flex flex-col gap-2">
              <Link to="/submit" className="text-sm hover:text-brand-orange transition-colors">List your property</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t px-6 py-4" style={{ borderTopColor: "rgba(217,79,43,0.15)" }}>
        <p className="text-xs text-center text-brand-cream/40">© {new Date().getFullYear()} HomeWise. Made for Delhi University students.</p>
      </div>
    </footer>

  );
}
