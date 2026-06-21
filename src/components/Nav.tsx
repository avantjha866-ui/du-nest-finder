import { Link } from "@tanstack/react-router";
import { useCompareList } from "@/lib/store";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Nav() {
  const { ids } = useCompareList();
  const [open, setOpen] = useState(false);

  const linkClass =
    "text-sm font-medium text-white/80 hover:text-white transition-colors";
  const activeProps = { className: "text-sm font-medium text-white" };

  return (
    <header className="sticky top-0 z-50 bg-navy/95 backdrop-blur border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-0.5 text-2xl font-bold tracking-tight">
          <span className="text-white">DU</span>
          <span className="text-brand-green">Nest</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/listings" className={linkClass} activeProps={activeProps}>
            Listings
          </Link>
          <Link to="/compare" className={linkClass} activeProps={activeProps}>
            Compare{ids.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-brand-green text-white text-[10px] font-bold w-5 h-5">
                {ids.length}
              </span>
            )}
          </Link>
          <Link
            to="/list-your-property"
            className="text-sm font-semibold bg-brand-green hover:bg-brand-green-dark text-white px-4 py-2 rounded-lg transition-colors"
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
            <Link to="/list-your-property" className="text-white/90 py-1 font-semibold" onClick={() => setOpen(false)}>
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
    <footer className="bg-navy text-white/70 mt-20">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row gap-8 justify-between">
        <div>
          <div className="text-xl font-bold">
            <span className="text-white">DU</span>
            <span className="text-brand-green">Nest</span>
          </div>
          <p className="text-sm mt-2 max-w-sm">
            Built by students, for students. Every listing is verified within 24 hours.
          </p>
          <div className="flex gap-4 mt-4">
            <a href="https://instagram.com/dunest" target="_blank" rel="noreferrer" className="text-xs hover:text-white transition-colors">Instagram</a>
            <a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noreferrer" className="text-xs hover:text-white transition-colors">WhatsApp</a>
          </div>
        </div>
        <div className="flex gap-12">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Students</div>
            <div className="flex flex-col gap-2">
              <Link to="/listings" className="text-sm hover:text-white transition-colors">Browse listings</Link>
              <Link to="/compare" className="text-sm hover:text-white transition-colors">Compare PG vs Flat</Link>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Owners</div>
            <div className="flex flex-col gap-2">
              <Link to="/list-your-property" className="text-sm hover:text-white transition-colors">List your property</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 px-6 py-4">
        <p className="text-xs text-center">© {new Date().getFullYear()} DUNest. Made for Delhi University students.</p>
      </div>
    </footer>
  );
}
