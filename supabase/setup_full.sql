-- ============================================================
-- DU NEST - Full Schema Setup
-- Paste this entire script into Supabase SQL Editor and run it
-- ============================================================

-- ============ CLEAN SLATE ============
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.student_interests CASCADE;
DROP TABLE IF EXISTS public.roommate_profiles CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.pg_owners CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'owner', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ============ PG OWNERS ============
CREATE TABLE public.pg_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  whatsapp text NOT NULL,
  alternate_phone text,
  is_verified boolean NOT NULL DEFAULT false,
  total_listings integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active'
);
GRANT SELECT, INSERT, UPDATE ON public.pg_owners TO authenticated;
GRANT ALL ON public.pg_owners TO service_role;
ALTER TABLE public.pg_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners view self" ON public.pg_owners FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "owners insert self" ON public.pg_owners FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owners update self" ON public.pg_owners FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete owners" ON public.pg_owners FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ LISTINGS ============
CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',

  owner_id uuid REFERENCES public.pg_owners(id) ON DELETE CASCADE,
  owner_name text,
  owner_whatsapp text,
  owner_email text,
  owner_alternate_phone text,

  type text CHECK (type IN ('pg','flat')),
  name text NOT NULL,
  locality text NOT NULL,
  address text,
  college text NOT NULL,
  gender text CHECK (gender IN ('girls','boys','coed')),
  curfew text,
  ac text,
  negotiable text,
  available_from date,

  has_single boolean NOT NULL DEFAULT false,
  price_single integer,
  has_double boolean NOT NULL DEFAULT false,
  price_double integer,
  has_triple boolean NOT NULL DEFAULT false,
  price_triple integer,

  total_rent integer,
  ideal_sharers integer,
  per_person_2 integer,
  per_person_3 integer,
  per_person_4 integer,
  flat_type text,

  walk_min integer,
  metro_station text,
  metro_walk_min integer,
  metro_fare integer,
  auto_cost integer,

  food_type text,
  breakfast_time text, breakfast_menu text,
  lunch_time text, lunch_menu text,
  dinner_time text, dinner_menu text,

  electricity text, electricity_cost text,
  water text, water_cost text,
  wifi text, wifi_cost text,
  laundry text, laundry_cost text,

  maid_available boolean NOT NULL DEFAULT false,
  maid_cost text,
  cook_available boolean NOT NULL DEFAULT false,
  cook_cost text,
  deposit integer,
  notice_period text,

  security text[],
  security_score integer,

  gym_name text, gym_distance text, gym_price integer,
  jogging_spot text, market text, hospital text, atm text, pharmacy text,
  area_description text,

  photos text[],

  views integer NOT NULL DEFAULT 0,
  enquiries integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false
);
GRANT SELECT ON public.listings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read approved listings" ON public.listings FOR SELECT TO anon, authenticated
  USING (status = 'approved');
CREATE POLICY "owners view own listings" ON public.listings FOR SELECT TO authenticated
  USING (
    owner_id IN (SELECT id FROM public.pg_owners WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "public submit pending listings" ON public.listings FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending');
CREATE POLICY "owners update own listings" ON public.listings FOR UPDATE TO authenticated
  USING (
    owner_id IN (SELECT id FROM public.pg_owners WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    owner_id IN (SELECT id FROM public.pg_owners WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "admin delete listings" ON public.listings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ ROOMMATE PROFILES ============
CREATE TABLE public.roommate_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  college text NOT NULL,
  course text,
  year text,
  budget_min integer,
  budget_max integer,
  move_in_date date,
  preferred_area text,
  gender_preference text,
  about_me text,
  whatsapp text NOT NULL,
  status text NOT NULL DEFAULT 'active'
);
GRANT SELECT, INSERT ON public.roommate_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roommate_profiles TO authenticated;
GRANT ALL ON public.roommate_profiles TO service_role;
ALTER TABLE public.roommate_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active profiles" ON public.roommate_profiles FOR SELECT TO anon, authenticated
  USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "public insert profiles" ON public.roommate_profiles FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(coalesce(name, '')) between 1 and 100
    AND length(coalesce(college, '')) between 1 and 200
    AND length(coalesce(whatsapp, '')) between 10 and 20
    AND status = 'active'
  );
CREATE POLICY "admin manage profiles" ON public.roommate_profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete profiles" ON public.roommate_profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ STUDENT INTERESTS ============
CREATE TABLE public.student_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  name text, college text, year text, budget text,
  move_in_date date, whatsapp text, gender_preference text
);
GRANT INSERT ON public.student_interests TO anon;
GRANT SELECT, INSERT ON public.student_interests TO authenticated;
GRANT ALL ON public.student_interests TO service_role;
ALTER TABLE public.student_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public insert interest" ON public.student_interests FOR INSERT TO anon, authenticated
  WITH CHECK (
    listing_id IS NOT NULL
    AND length(coalesce(whatsapp, '')) between 10 and 20
  );
CREATE POLICY "owners see own listing interests" ON public.student_interests FOR SELECT TO authenticated
  USING (
    listing_id IN (
      SELECT l.id FROM public.listings l
      JOIN public.pg_owners o ON o.id = l.owner_id
      WHERE o.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- ============ CHAT MESSAGES ============
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  sender_name text NOT NULL,
  sender_college text NOT NULL,
  message text NOT NULL CHECK (char_length(message) <= 500),
  room_id text NOT NULL DEFAULT 'general'
);

CREATE INDEX IF NOT EXISTS chat_messages_room_created ON public.chat_messages (room_id, created_at DESC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chat messages" ON public.chat_messages FOR SELECT
  USING (true);
CREATE POLICY "Anyone can send chat messages" ON public.chat_messages FOR INSERT
  WITH CHECK (char_length(message) > 0 AND char_length(sender_name) > 0);

GRANT SELECT, INSERT ON public.chat_messages TO anon;
GRANT ALL ON public.chat_messages TO service_role;

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- ============ updated_at triggers ============
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_listings_touch BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
CREATE TRIGGER trg_pg_owners_touch BEFORE UPDATE ON public.pg_owners
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
