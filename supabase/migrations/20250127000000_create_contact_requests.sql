-- Create contact_requests table
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_contact_requests_email ON public.contact_requests(email);
CREATE INDEX idx_contact_requests_status ON public.contact_requests(status);
CREATE INDEX idx_contact_requests_created_at ON public.contact_requests(created_at);

-- Create RLS policies
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert contact requests (for the contact form)
CREATE POLICY "Anyone can insert contact requests" ON public.contact_requests
    FOR INSERT WITH CHECK (true);

-- Only authenticated users can view contact requests (for admin panel)
CREATE POLICY "Authenticated users can view contact requests" ON public.contact_requests
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can update contact requests
CREATE POLICY "Authenticated users can update contact requests" ON public.contact_requests
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create trigger to update updated_at column
CREATE TRIGGER update_contact_requests_updated_at 
    BEFORE UPDATE ON public.contact_requests 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 