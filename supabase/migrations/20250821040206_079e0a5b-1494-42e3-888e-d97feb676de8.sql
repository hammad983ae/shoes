-- Fix storage policies for avatar uploads
-- First, drop existing policies to recreate them correctly
drop policy if exists "Avatar images are publicly accessible" on storage.objects;
drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;
drop policy if exists "Users can delete their own avatar" on storage.objects;

-- Create corrected storage policies for avatars
create policy "Avatar images are publicly accessible" 
on storage.objects 
for select 
using (bucket_id = 'avatars');

create policy "Users can upload their own avatar" 
on storage.objects 
for insert 
with check (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own avatar" 
on storage.objects 
for update 
using (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own avatar" 
on storage.objects 
for delete 
using (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = auth.uid()::text
);