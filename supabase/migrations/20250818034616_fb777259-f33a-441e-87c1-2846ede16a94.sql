-- Add RLS policies for site_analytics_realtime
CREATE POLICY "Anyone can view site analytics realtime" 
ON public.site_analytics_realtime 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage site analytics realtime" 
ON public.site_analytics_realtime 
FOR ALL 
USING (true);

-- Add RLS policies for creator_invites
CREATE POLICY "Admins can manage creator invites" 
ON public.creator_invites 
FOR ALL 
USING (is_admin());