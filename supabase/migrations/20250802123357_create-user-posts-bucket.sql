-- Create storage bucket for user post media
INSERT INTO storage.buckets (id, name, public) VALUES ('user-posts', 'user-posts', true);

-- Create storage policies for user-posts bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'user-posts');

CREATE POLICY "Authenticated users can upload posts" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'user-posts' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own posts" ON storage.objects FOR UPDATE 
USING (bucket_id = 'user-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own posts" ON storage.objects FOR DELETE 
USING (bucket_id = 'user-posts' AND auth.uid()::text = (storage.foldername(name))[1]);
