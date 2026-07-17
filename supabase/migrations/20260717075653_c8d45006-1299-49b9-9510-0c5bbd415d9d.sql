ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS colleges_list text;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS college_walk_times_text text;
NOTIFY pgrst, 'reload schema';