
-- Create the item_requests table
CREATE TABLE public.item_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  brand text,
  category text,
  reference_url text,
  notes text,
  status text DEFAULT 'new',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.item_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own requests
CREATE POLICY "Users can create their own item requests" 
  ON public.item_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own requests
CREATE POLICY "Users can view their own item requests" 
  ON public.item_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Admin can view all requests (assuming admin role exists)
CREATE POLICY "Admins can view all item requests" 
  ON public.item_requests 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND (raw_user_meta_data ->> 'role' = 'admin' OR display_name ILIKE '%admin%')
    )
  );
