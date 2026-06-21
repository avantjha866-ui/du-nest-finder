import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { COLLEGES } from "@/lib/data";
import {
  Clock,
  Utensils,
  Train,
  Users,
  ShieldCheck,
  Wallet,
  MapPin,
  BarChart3,
  Search,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DUNest — Find verified PGs & Flats near Delhi University" },
      {
        name: "description",
        content:
          "Delhi University's #1 housing platform — walk time, food schedule, metro cost, flatmate matching and security in one place.",
      },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { icon: Clock, title: "Real walk time", desc: "Actual minutes to your college gate." },
  { icon: Utensils, title: "Full food schedule", desc: "Breakfast, lunch & dinner timings + menu." },
  { icon: Train, title: "Metro + pass cost", desc: "Station name, walk and monthly pass." },
  { icon: Users, title: "Flatmate matching", desc: "Split rent 3 ways, find your group." },
  { icon: ShieldCheck, title: "Security details", desc: "CCTV, guard, biometric — verified." },
  { icon: Wallet, title: "Every expense shown", desc: "Light, water, maid, laundry, gym." },
  { icon: MapPin, title: "Nearby amenities", desc: "Gym, market, hospital, ATM, parks." },
  { icon: BarChart3, title: "PG vs Flat compare", desc: "Real monthly cost, side by side." },
];

function Home() {
  const navigate = useNavigate();
  const [college, setCollege] = useState<string>(COLLEGES[0]);
  const [type, setType] = useState<string>("Both");
  const [distance, setDistance] = useState<string>("3");

  const onSearch = () => {
    navigate({
      to: "/listings",
      search: { college, type, distance } as never,
    });
  };

  return (
    <div>
      {/* HERO */}
      <section className="hero-grid-bg text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-24 sm:pt-20 sm:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white/90">
              <Sparkles size={14} className="text-brand-green" />
              Delhi University's #1 Housing Platform
            </span>
            <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight">
              Find your perfect <span className="text-brand-green">PG or Flat</span> near DU
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
              Walk time, food schedule, metro cost, flatmate matching, security — everything in one
              place.
            </p>
          </div>

          {/* Search card */}
          <div className="mt-10 max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 text-foreground">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select label="Your college" value={college} onChange={setCollege}>
                {COLLEGES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
              <Select label="Looking for" value={type} onChange={setType}>
                <option>Both</option>
                <option>PG only</option>
                <option>Flat only</option>
              </Select>
              <Select label="Distance" value={distance} onChange={setDistance}>
                <option value="1">Within 1 km</option>
                <option value="2">Within 2 km</option>
                <option value="3">Within 3 km</option>
                <option value="5">Within 5 km</option>
              </Select>
            </div>
            <button
              onClick={onSearch}
              className="mt-4 w-full bg-brand-green hover:bg-brand-green-dark transition-colors text-white font-semibold py-4 rounded-xl text-base inline-flex items-center justify-center gap-2"
            >
              <Search size={18} />
              Find PGs & Flats
            </button>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              ["120+", "Verified listings"],
              ["10", "DU colleges"],
              ["850+", "Students helped"],
              ["₹6,000", "Lowest rent"],
            ].map(([v, l]) => (
              <div
                key={l}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center"
              >
                <div className="text-2xl font-bold text-brand-green">{v}</div>
                <div className="text-xs text-white/70 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold">Everything a DU student needs to decide.</h2>
          <p className="mt-3 text-muted-foreground">
            Generic listing sites stop at price and photos. We go deeper — because the real cost of
            living lives in the details.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white border border-border rounded-2xl p-5 hover:border-brand-green/40 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-accent text-brand-green-dark flex items-center justify-center">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 font-semibold text-base">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OWNER CTA */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Own a PG or Flat near DU?</h2>
            <p className="mt-3 text-white/70 max-w-lg">
              List for free. We verify and publish within 24 hours. Reach thousands of DU students actively searching for housing.
            </p>
            <ul className="mt-4 space-y-1.5">
              {["Free to list — no commission", "Verified badge on your listing", "Direct WhatsApp contact from students"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/80">
                  <span className="text-brand-green font-bold">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <a
            href="/submit"
            className="shrink-0 bg-brand-green hover:bg-brand-green-dark text-white font-bold px-8 py-4 rounded-xl text-base transition-colors"
          >
            List your property →
          </a>
        </div>
      </section>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green"
      >
        {children}
      </select>
    </label>
  );
}
