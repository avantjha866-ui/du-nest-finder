import { createClient } from "@supabase/supabase-js";

export const DUNEST_SUPABASE_URL = "https://gmazuqqpwmjibbwskeul.supabase.co";
export const DUNEST_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYXp1cXFwd21qaWJid3NrZXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODQyNTksImV4cCI6MjA5Njg2MDI1OX0.qwUmb5KA4hRFINEqIXFmCTNi3KP6xiEs4XlnyAB3JW0";

export type DirectListingRow = {
  id: string;
  created_at: string | null;
  status: string;
  type: string | null;
  name: string | null;
  locality: string | null;
  college: string | null;
  rent: number | null;
  walk_min: number | null;
  gender: string | null;
  curfew: string | null;
  ac: string | null;
  negotiable: string | null;
  security: string[] | null;
  wifi: string | null;
  sharers: number | null;
  food_type: string | null;
  breakfast_time: string | null;
  breakfast_menu: string | null;
  lunch_time: string | null;
  lunch_menu: string | null;
  dinner_time: string | null;
  dinner_menu: string | null;
  electricity: string | null;
  water: string | null;
  laundry: string | null;
  metro_station: string | null;
  metro_walk_min: number | null;
  metro_fare: number | null;
  auto_cost: number | null;
  deposit: number | null;
  gym_name: string | null;
  gym_distance: string | null;
  gym_price: number | null;
  jogging: string | null;
  market: string | null;
  hospital: string | null;
  atm: string | null;
  pharmacy: string | null;
  maid_cost: string | null;
  cook_cost: string | null;
  area_description: string | null;
  owner_name: string | null;
  whatsapp: string | null;
  notes: string | null;
};

export const directSupabase = createClient(DUNEST_SUPABASE_URL, DUNEST_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});