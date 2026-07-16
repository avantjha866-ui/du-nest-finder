import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { DirectListingRow } from "@/lib/directSupabase";

const PUBLIC_SELECT =
  "id, created_at, status, type, name, locality, address, college, colleges, college_walk_times, gender, curfew, ac, negotiable, available_from, has_single, price_single, has_double, price_double, has_triple, price_triple, total_rent, ideal_sharers, per_person_2, per_person_3, per_person_4, flat_type, walk_min, metro_station, metro_walk_min, metro_fare, auto_cost, food_type, breakfast_time, breakfast_menu, lunch_time, lunch_menu, dinner_time, dinner_menu, electricity, electricity_cost, water, water_cost, wifi, wifi_cost, laundry, laundry_cost, maid_available, maid_cost, cook_available, cook_cost, deposit, notice_period, security, security_score, gym_name, gym_distance, gym_price, jogging_spot, market, hospital, atm, pharmacy, area_description, photos, is_featured, owner_name, owner_whatsapp";


export const getListingById = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("listings")
      .select(PUBLIC_SELECT)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error("Failed to load listing.");
    return (row ?? null) as unknown as DirectListingRow | null;
  });
