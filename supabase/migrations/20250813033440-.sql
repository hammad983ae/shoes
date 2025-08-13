-- Fix contact_requests table RLS security issue
-- Drop the overly permissive policy that allows all authenticated users to view contact requests
DROP POLICY IF EXISTS "Authenticated users can view contact requests" ON public.contact_requests;

-- Create a more restrictive policy that only allows admins to view contact requests
-- This prevents customer email harvesting by regular authenticated users
CREATE POLICY "Only admins can view contact requests" ON public.contact_requests
FOR SELECT
USING (is_admin());

-- Keep the existing insert policy that allows anyone to submit contact requests
-- This is necessary for the public contact form to work
-- The existing policy: "Anyone can insert contact requests" should remain unchanged