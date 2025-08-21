-- Create avatars storage bucket
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Create storage policies for avatars
create policy "Avatar images are publicly accessible" 
on storage.objects 
for select 
using (bucket_id = 'avatars');

create policy "Users can upload their own avatar" 
on storage.objects 
for insert 
with check (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar" 
on storage.objects 
for update 
using (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar" 
on storage.objects 
for delete 
using (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add avatar_url column to profiles if it doesn't exist
alter table public.profiles 
add column if not exists avatar_url text;