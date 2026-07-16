ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS colleges text[];
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS college_walk_times jsonb;
CREATE INDEX IF NOT EXISTS listings_colleges_gin ON public.listings USING gin (colleges);