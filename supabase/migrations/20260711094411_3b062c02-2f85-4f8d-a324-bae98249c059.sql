-- Allow anonymous public submissions of pending listings without requiring owner_id
CREATE POLICY "public submit pending listings"
ON public.listings
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');

GRANT INSERT ON public.listings TO anon;