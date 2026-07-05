
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Tighten the two "always true" WITH CHECK policies with minimal shape checks
DROP POLICY IF EXISTS "public insert profiles" ON public.roommate_profiles;
CREATE POLICY "public insert profiles" ON public.roommate_profiles FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(coalesce(name, '')) between 1 and 100
    AND length(coalesce(college, '')) between 1 and 200
    AND length(coalesce(whatsapp, '')) between 10 and 20
    AND status = 'active'
  );

DROP POLICY IF EXISTS "public insert interest" ON public.student_interests;
CREATE POLICY "public insert interest" ON public.student_interests FOR INSERT TO anon, authenticated
  WITH CHECK (
    listing_id IS NOT NULL
    AND length(coalesce(whatsapp, '')) between 10 and 20
  );
