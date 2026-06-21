import { createServerFn } from "@tanstack/react-start";
import type { DirectListingRow } from "@/lib/directSupabase";
import type { College, Gender, Listing, ListingType } from "@/lib/data";

const text = (value: string | null, fallback = "Not specified") => value?.trim() || fallback;

function mapListing(row: DirectListingRow): Listing | null {
  if (!row.id) return null;
  const ac = ["yes", "true", "included", "available"].includes((row.ac ?? "").toLowerCase());

  const rawNotes = row.notes ?? "";
  const noteParts = rawNotes
    .split(/[|,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const photoUrls = noteParts
    .filter((s) => s.startsWith("http") && (s.includes(".jpg") || s.includes(".jpeg") || s.includes(".png") || s.includes(".webp") || s.includes("/photo") || s.includes("imgur") || s.includes("cloudinary")));

  const textNotes = noteParts.filter((s) => !photoUrls.includes(s)).join(" | ");

  return {
    id: row.id,
    type: (row.type?.toLowerCase() === "flat" ? "Flat" : "PG") as ListingType,
    name: text(row.name, "Unnamed listing"),
    locality: text(row.locality),
    college: text(row.college, "Delhi University") as College,
    rent: row.rent ?? 0,
    walkMinutes: row.walk_min ?? 0,
    gender: text(row.gender, "Co-ed") as Gender,
    curfew: text(row.curfew, "None"),
    ac,
    idealSharers: row.sharers ?? undefined,
    metroStation: text(row.metro_station),
    metroWalk: row.metro_walk_min ?? 0,
    metroPass: row.metro_fare ?? 0,
    autoCost: row.auto_cost ?? undefined,
    food: text(row.food_type, "None") as Listing["food"],
    meals: {
      breakfast: row.breakfast_time ? { timing: row.breakfast_time, menu: row.breakfast_menu ?? "" } : undefined,
      lunch: row.lunch_time ? { timing: row.lunch_time, menu: row.lunch_menu ?? "" } : undefined,
      dinner: row.dinner_time ? { timing: row.dinner_time, menu: row.dinner_menu ?? "" } : undefined,
    },
    electricity: text(row.electricity, "Not specified"),
    water: text(row.water, "Not specified"),
    laundry: text(row.laundry, "Not specified"),
    internet: text(row.wifi),
    security: row.security ?? [],
    negotiable: (row.negotiable as Listing["negotiable"]) ?? "No",
    amenities: {
      gym: row.gym_name ? { name: row.gym_name, distance: row.gym_distance ?? "", fee: row.gym_price ?? 0 } : undefined,
      jogging: row.jogging ? { name: row.jogging, distance: "" } : undefined,
      market: row.market ? { name: row.market, walk: "" } : undefined,
      hospital: row.hospital ? { name: row.hospital, distance: "" } : undefined,
      atm: row.atm ? { name: row.atm, walk: "" } : undefined,
      pharmacy: row.pharmacy ? { name: row.pharmacy, walk: "" } : undefined,
    },
    maid: row.maid_cost ? Number(row.maid_cost.replace(/[^0-9]/g, "")) || undefined : undefined,
    cook: row.cook_cost ? Number(row.cook_cost.replace(/[^0-9]/g, "")) || undefined : undefined,
    deposit: row.deposit ?? undefined,
    localityDesc: text(row.area_description ?? textNotes, "Student-friendly area near Delhi University."),
    whatsapp: row.whatsapp ?? undefined,
    photos: photoUrls.length > 0 ? photoUrls : undefined,
  };
}

export const getApprovedListings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("id, created_at, status, type, name, locality, college, rent, walk_min, gender, curfew, ac, negotiable, security, wifi, sharers, food_type, breakfast_time, breakfast_menu, lunch_time, lunch_menu, dinner_time, dinner_menu, electricity, water, laundry, metro_station, metro_walk_min, metro_fare, auto_cost, deposit, gym_name, gym_distance, gym_price, jogging, market, hospital, atm, pharmacy, maid_cost, cook_cost, area_description, notes, whatsapp")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getApprovedListings] Supabase error:", error);
    throw new Error("Failed to load listings. Please try again later.");
  }
  return ((data ?? []) as DirectListingRow[]).map(mapListing).filter((listing): listing is Listing => listing !== null);
});