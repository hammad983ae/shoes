import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase clients
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check if user is admin
    const { data: adminCheck } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (adminCheck?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    if (req.method === 'GET') {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Get auth users with service role to get emails
      const { data: authData, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (authUsersError) {
        throw authUsersError;
      }

      // Create a map of user_id to email
      const emailMap = new Map();
      authData.users.forEach((authUser: any) => {
        emailMap.set(authUser.id, authUser.email);
      });

      // Merge profile data with email data
      const enrichedUsers = profiles?.map((profile: any) => ({
        id: profile.user_id,
        email: emailMap.get(profile.user_id) || 'No email found',
        display_name: profile.display_name || 'No name',
        role: profile.role || 'user',
        is_creator: profile.is_creator || false,
        creator_tier: profile.creator_tier || 'tier1',
        commission_rate: profile.commission_rate || 0.10,
        coupon_code: profile.coupon_code || null,
        credits: profile.credits || 0,
        created_at: profile.created_at
      })) || [];

      return new Response(
        JSON.stringify({ users: enrichedUsers }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Admin users function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});