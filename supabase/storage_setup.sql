-- Run this in Supabase SQL Editor after creating the 'listing-photos' bucket as public

-- Allow anyone to upload to listing-photos (for listing submissions)
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do update set public = true;

-- Allow anon to upload files
create policy "anon can upload listing photos"
on storage.objects for insert
to anon
with check (bucket_id = 'listing-photos');

-- Allow public read
create policy "public can read listing photos"
on storage.objects for select
to public
using (bucket_id = 'listing-photos');
