import { MapPin, Train } from "lucide-react";
import { COLLEGE_DISTANCES } from "@/lib/data";

interface NearbyCollegesProps {
  locality: string;
  primaryCollege: string;
  walkMinutes: number;
  metroStation: string;
  metroWalk: number;
  metroPass: number;
}

export function NearbyColleges({
  locality,
  primaryCollege,
  walkMinutes,
  metroStation,
  metroWalk,
  metroPass,
}: NearbyCollegesProps) {
  // Find best matching locality key (case-insensitive partial match)
  const localityKey = Object.keys(COLLEGE_DISTANCES).find((k) =>
    locality.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(locality.toLowerCase())
  );

  const distMap = localityKey ? COLLEGE_DISTANCES[localityKey] : null;
  const primaryInfo = distMap?.[primaryCollege];

  return (
    <div className="mb-5">
      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
        <MapPin size={14} className="text-brand-green" /> College distances
      </h4>

      {/* Primary college — always shown */}
      <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-3 mb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-brand-green-dark">{primaryCollege}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{locality}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-navy">{walkMinutes} min walk</div>
            {primaryInfo && (
              <div className="text-[11px] text-muted-foreground mt-1">
                {primaryInfo.km} km · {primaryInfo.metro}
              </div>
            )}
          </div>
        </div>
        {metroStation && (
          <div className="flex flex-wrap items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Train size={11} />
            <span>{metroStation}</span>
            <span className="mx-1">·</span>
            <span>{metroWalk} min walk</span>
            {metroPass > 0 && (
              <>
                <span className="mx-1">·</span>
                <span className="font-medium text-navy">₹{metroPass}/mo pass</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Nearby colleges from distance map */}
      {distMap && Object.keys(distMap).length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Other colleges nearby</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {Object.entries(distMap)
              .filter(([college]) => college !== primaryCollege)
              .sort(([, a], [, b]) => a.km - b.km)
              .slice(0, 6)
              .map(([college, info]) => (
                <div key={college} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2 text-xs">
                  <span className="text-foreground font-medium truncate max-w-[120px]">{college}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-muted-foreground">{info.km} km</span>
                    <span className="text-brand-green font-semibold">₹{info.metroFare}</span>
                  </div>
                </div>
              ))}
          </div>
          <p className="text-[10px] text-muted-foreground">Metro fare = one-way token price</p>
        </div>
      )}

      {!distMap && (
        <p className="text-xs text-muted-foreground italic">
          Exact distances for this locality coming soon.
        </p>
      )}
    </div>
  );
}
