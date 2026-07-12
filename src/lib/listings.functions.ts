import { createServerFn } from "@tanstack/react-start";
import type { DirectListingRow } from "@/lib/directSupabase";
import type { College, Gender, Listing, ListingType } from "@/lib/data";

const text = (value: string | null | undefined, fallback = "Not specified") =>
  (value ?? "").trim() || fallback;

const boolish = (v: string | null | undefined) =>
  ["yes", "true", "included", "available"].includes((v ?? "").toLowerCase());

const mapGender = (g: string | null): Gender => {
  const s = (g ?? "").toLowerCase();
  if (s === "girls") return "Girls only";
  if (s === "boys") return "Boys only";
  return "Co-ed";
};

const mapFood = (f: string | null): Listing["food"] => {
  const s = (f ?? "").toLowerCase();
  if (s === "included") return "Included";
  if (s === "tiffin") return "Tiffin service";
  if (s === "self" || s === "self_cooking" || s === "self-cooking") return "Self-cooking";
  return "None";
};

function mapListing(row: DirectListingRow): Listing | null {
  if (!row.id) return null;
  const isFlat = (row.type ?? "").toLowerCase() === "flat";

  // Room prices (PG)
  const roomPrices: NonNullable<Listing["roomPrices"]> = {};
  if (row.has_single && row.price_single) roomPrices.single = row.price_single;
  if (row.has_double && row.price_double) roomPrices.double = row.price_double;
  if (row.has_triple && row.price_triple) roomPrices.triple = row.price_triple;

  // Effective displayed rent
  const pgLowest = [roomPrices.triple, roomPrices.double, roomPrices.single]
    .filter((n): n is number => typeof n === "number" && n > 0);
  const rent = isFlat
    ? row.total_rent ?? 0
    : pgLowest.length > 0
    ? Math.min(...pgLowest)
    : 0;

  // Per-person for flats
  const perPerson: NonNullable<Listing["perPerson"]> = {};
  if (row.per_person_2) perPerson.two = row.per_person_2;
  else if (isFlat && row.total_rent) perPerson.two = Math.round(row.total_rent / 2);
  if (row.per_person_3) perPerson.three = row.per_person_3;
  else if (isFlat && row.total_rent) perPerson.three = Math.round(row.total_rent / 3);
  if (row.per_person_4) perPerson.four = row.per_person_4;
  else if (isFlat && row.total_rent) perPerson.four = Math.round(row.total_rent / 4);

  return {
    id: row.id,
    type: (isFlat ? "Flat" : "PG") as ListingType,
    name: text(row.name, "Unnamed listing"),
    locality: text(row.locality),
    college: text(row.college, "Delhi University") as College,
    rent,
    walkMinutes: row.walk_min ?? 0,
    gender: mapGender(row.gender),
    curfew: text(row.curfew, "None"),
    ac: boolish(row.ac),
    idealSharers: row.ideal_sharers ?? undefined,
    metroStation: text(row.metro_station),
    metroWalk: row.metro_walk_min ?? 0,
    metroPass: row.metro_fare ?? 0,
    autoCost: row.auto_cost ?? undefined,
    food: mapFood(row.food_type),
    meals: {
      breakfast: row.breakfast_time
        ? { timing: row.breakfast_time, menu: row.breakfast_menu ?? "" }
        : undefined,
      lunch: row.lunch_time
        ? { timing: row.lunch_time, menu: row.lunch_menu ?? "" }
        : undefined,
      dinner: row.dinner_time
        ? { timing: row.dinner_time, menu: row.dinner_menu ?? "" }
        : undefined,
    },
    electricity: text(row.electricity),
    water: text(row.water),
    laundry: text(row.laundry),
    internet: text(row.wifi),
    security: row.security ?? [],
    negotiable: ((row.negotiable ?? "No") as Listing["negotiable"]),
    amenities: {
      gym: row.gym_name
        ? { name: row.gym_name, distance: row.gym_distance ?? "", fee: row.gym_price ?? 0 }
        : undefined,
      jogging: row.jogging_spot ? { name: row.jogging_spot, distance: "" } : undefined,
      market: row.market ? { name: row.market, walk: "" } : undefined,
      hospital: row.hospital ? { name: row.hospital, distance: "" } : undefined,
      atm: row.atm ? { name: row.atm, walk: "" } : undefined,
      pharmacy: row.pharmacy ? { name: row.pharmacy, walk: "" } : undefined,
    },
    maid: row.maid_cost ? Number(row.maid_cost.replace(/[^0-9]/g, "")) || undefined : undefined,
    cook: row.cook_cost ? Number(row.cook_cost.replace(/[^0-9]/g, "")) || undefined : undefined,
    deposit: row.deposit ?? undefined,
    bhk: row.flat_type ?? undefined,
    localityDesc: text(row.area_description, "Student-friendly area near Delhi University."),
    photos: row.photos && row.photos.length > 0 ? row.photos : undefined,
    featured: !!row.is_featured,
    roomPrices: Object.keys(roomPrices).length > 0 ? roomPrices : undefined,
    perPerson: Object.keys(perPerson).length > 0 ? perPerson : undefined,
    totalRent: row.total_rent ?? undefined,
    flatType: row.flat_type ?? undefined,
  };
}

const PUBLIC_SELECT =
  "id, created_at, status, type, name, locality, address, college, gender, curfew, ac, negotiable, available_from, has_single, price_single, has_double, price_double, has_triple, price_triple, total_rent, ideal_sharers, per_person_2, per_person_3, per_person_4, flat_type, walk_min, metro_station, metro_walk_min, metro_fare, auto_cost, food_type, breakfast_time, breakfast_menu, lunch_time, lunch_menu, dinner_time, dinner_menu, electricity, electricity_cost, water, water_cost, wifi, wifi_cost, laundry, laundry_cost, maid_available, maid_cost, cook_available, cook_cost, deposit, notice_period, security, security_score, gym_name, gym_distance, gym_price, jogging_spot, market, hospital, atm, pharmacy, area_description, photos, is_featured";

export const getApprovedListings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("listings")
    .select(PUBLIC_SELECT)
    .in("status", ["approved", "pending"])
    .order("is_featured", { ascending: false })
    .order("walk_min", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getApprovedListings] Supabase error:", error);
    throw new Error("Failed to load listings. Please try again later.");
  }
  return ((data ?? []) as unknown as DirectListingRow[])
    .map(mapListing)
    .filter((l): l is Listing => l !== null);
});
