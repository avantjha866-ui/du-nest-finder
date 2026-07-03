-- Revoke column-level SELECT on sensitive contact columns from public roles.
-- RLS filters rows; column privileges are needed to hide specific columns.
REVOKE SELECT (owner_name, whatsapp, phone2) ON public.listings FROM anon;
REVOKE SELECT (owner_name, whatsapp, phone2) ON public.listings FROM authenticated;

-- Ensure remaining safe columns remain selectable by anon/authenticated.
GRANT SELECT (
  id, created_at, status, type, name, locality, college, rent, walk_min,
  gender, curfew, ac, negotiable, security, metro_station, metro_walk_min,
  metro_fare, auto_cost, food_type, breakfast_time, breakfast_menu,
  lunch_time, lunch_menu, dinner_time, dinner_menu, electricity,
  electricity_cost, water, laundry, laundry_cost, wifi, sharers,
  maid_cost, cook_cost, deposit, gym_name, gym_distance, gym_price,
  jogging, market, hospital, atm, pharmacy, area_description, notes
) ON public.listings TO anon, authenticated;

-- Service role retains full access for edge/admin functions.
GRANT ALL ON public.listings TO service_role;