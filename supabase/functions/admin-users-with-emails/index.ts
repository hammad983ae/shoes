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
    console.log('Starting admin-users-with-emails function...');

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
    console.log('Checking user authentication...');
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: authError.message }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    if (!user) {
      console.error('No user found in request');
      return new Response(
        JSON.stringify({ error: 'No authenticated user found' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('User authenticated:', user.id);

    // Check if user is admin
    console.log('Checking admin privileges...');
    const { data: adminCheck, error: adminCheckError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (adminCheckError) {
      console.error('Admin check error:', adminCheckError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status', details: adminCheckError.message }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Admin check result:', adminCheck);

    if (!adminCheck || adminCheck.role !== 'admin') {
      console.error('User is not admin. Role:', adminCheck?.role);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required', currentRole: adminCheck?.role }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Admin access verified!');

    if (req.method === 'GET') {
      console.log('Fetching profiles...');
      // Get all profiles with robust LEFT JOINs - never filter out users
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Profiles error:', profilesError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch profiles', details: profilesError.message }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }

      console.log('Profiles fetched:', profiles?.length || 0);

      // Get auth users with service role to get emails
      const { data: authData, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (authUsersError) {
        console.error('Auth users error:', authUsersError);
        throw authUsersError;
      }

      // Get coupon codes with error handling
      const { data: couponCodes, error: couponError } = await supabaseAdmin
        .from('coupon_codes')
        .select('creator_id, code');
      
      // Don't fail if coupon codes table has issues
      if (couponError) {
        console.warn('Coupon codes error (non-fatal):', couponError);
      }

      // Create maps for efficient lookup
      const emailMap = new Map();
      authData.users.forEach((authUser: any) => {
        emailMap.set(authUser.id, authUser.email);
      });

      const couponMap = new Map();
      if (couponCodes) {
        couponCodes.forEach((coupon: any) => {
          couponMap.set(coupon.creator_id, coupon.code);
        });
      }

      // Merge profile data with email and coupon data - ALWAYS include all profiles
      const enrichedUsers = profiles?.map((profile: any) => ({
        id: profile.user_id,
        email: emailMap.get(profile.user_id) || 'Email not found',
        display_name: profile.display_name || 'No name',
        role: profile.role || 'user',
        is_creator: profile.is_creator || false,
        creator_tier: profile.creator_tier || 'tier1',
        commission_rate: profile.commission_rate || 0.10,
        coupon_code: couponMap.get(profile.user_id) || profile.coupon_code || null,
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