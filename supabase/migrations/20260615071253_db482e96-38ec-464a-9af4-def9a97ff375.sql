REVOKE SELECT ON TABLE public.listings FROM anon, authenticated;

GRANT SELECT (
  id, created_at, status, type, name, locality, college, rent, walk_min,
  gender, curfew, ac, negotiable, security, metro_station, metro_walk_min,
  metro_fare, auto_cost, food_type, breakfast_time, breakfast_menu,
  lunch_time, lunch_menu, dinner_time, dinner_menu, electricity,
  electricity_cost, water, laundry, laundry_cost, wifi, sharers,
  maid_cost, cook_cost, deposit, gym_name, gym_distance, gym_price,
  jogging, market, hospital, atm, pharmacy, area_description, notes
) ON TABLE public.listings TO anon, authenticated;

DROP POLICY IF EXISTS "Public can view approved listings" ON public.listings;
CREATE POLICY "Public can view approved listings without contacts"
ON public.listings
FOR SELECT
TO anon, authenticated
USING (status = 'approved');

CREATE OR REPLACE VIEW public.approved_listings_public
WITH (security_invoker = on)
AS
SELECT
  id, created_at, status, type, name, locality, college, rent, walk_min,
  gender, curfew, ac, negotiable, security, metro_station, metro_walk_min,
  metro_fare, auto_cost, food_type, breakfast_time, breakfast_menu,
  lunch_time, lunch_menu, dinner_time, dinner_menu, electricity,
  electricity_cost, water, laundry, laundry_cost, wifi, sharers,
  maid_cost, cook_cost, deposit, gym_name, gym_distance, gym_price,
  jogging, market, hospital, atm, pharmacy, area_description, notes
FROM public.listings
WHERE status = 'approved';

REVOKE ALL ON TABLE public.approved_listings_public FROM PUBLIC;
GRANT SELECT ON TABLE public.approved_listings_public TO anon, authenticated;
GRANT ALL ON TABLE public.approved_listings_public TO service_role;