CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  type text CHECK (type IN ('pg', 'flat')),
  name text,
  locality text,
  college text,
  rent integer,
  walk_min integer,
  gender text,
  curfew text,
  ac text,
  negotiable text,
  security text[],
  metro_station text,
  metro_walk_min integer,
  metro_fare integer,
  auto_cost integer,
  food_type text,
  breakfast_time text,
  breakfast_menu text,
  lunch_time text,
  lunch_menu text,
  dinner_time text,
  dinner_menu text,
  electricity text,
  electricity_cost text,
  water text,
  laundry text,
  laundry_cost text,
  wifi text,
  sharers integer,
  maid_cost text,
  cook_cost text,
  deposit integer,
  gym_name text,
  gym_distance text,
  gym_price integer,
  jogging text,
  market text,
  hospital text,
  atm text,
  pharmacy text,
  area_description text,
  owner_name text,
  whatsapp text,
  phone2 text,
  notes text
);

GRANT SELECT, INSERT ON public.listings TO anon;
GRANT SELECT, INSERT ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved listings"
ON public.listings
FOR SELECT
TO anon, authenticated
USING (status = 'approved');

CREATE POLICY "Public can submit pending listings"
ON public.listings
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');