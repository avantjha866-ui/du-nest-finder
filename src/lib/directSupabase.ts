import { createClient } from "@supabase/supabase-js";

export const DUNEST_SUPABASE_URL = "https://gmazuqqpwmjibbwskeul.supabase.co";
export const DUNEST_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYXp1cXFwd21qaWJid3NrZXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODQyNTksImV4cCI6MjA5Njg2MDI1OX0.qwUmb5KA4hRFINEqIXFmCTNi3KP6xiEs4XlnyAB3JW0";

/** Row shape returned by the public projection on `listings` (approved rows). */
export type DirectListingRow = {
  id: string;
  created_at: string | null;
  status: string;
  type: string | null;
  name: string;
  locality: string;
  address: string | null;
  college: string;
  gender: string | null;
  curfew: string | null;
  ac: string | null;
  negotiable: string | null;
  available_from: string | null;

  has_single: boolean | null;
  price_single: number | null;
  has_double: boolean | null;
  price_double: number | null;
  has_triple: boolean | null;
  price_triple: number | null;

  total_rent: number | null;
  ideal_sharers: number | null;
  per_person_2: number | null;
  per_person_3: number | null;
  per_person_4: number | null;
  flat_type: string | null;

  walk_min: number | null;
  metro_station: string | null;
  metro_walk_min: number | null;
  metro_fare: number | null;
  auto_cost: number | null;

  food_type: string | null;
  breakfast_time: string | null; breakfast_menu: string | null;
  lunch_time: string | null; lunch_menu: string | null;
  dinner_time: string | null; dinner_menu: string | null;

  electricity: string | null; electricity_cost: string | null;
  water: string | null; water_cost: string | null;
  wifi: string | null; wifi_cost: string | null;
  laundry: string | null; laundry_cost: string | null;

  maid_available: boolean | null; maid_cost: string | null;
  cook_available: boolean | null; cook_cost: string | null;
  deposit: number | null;
  notice_period: string | null;

  security: string[] | null;
  security_score: number | null;

  gym_name: string | null; gym_distance: string | null; gym_price: number | null;
  jogging_spot: string | null;
  market: string | null; hospital: string | null; atm: string | null; pharmacy: string | null;
  area_description: string | null;

  photos: string[] | null;

  is_featured: boolean | null;
};

export const directSupabase = createClient(DUNEST_SUPABASE_URL, DUNEST_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
