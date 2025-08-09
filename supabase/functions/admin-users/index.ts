import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
  });

  try {
    // Auth check
    const { data: authData } = await supabaseUser.auth.getUser();
    const requesterId = authData?.user?.id;
    if (!requesterId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Admin check
    const { data: requesterProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', requesterId)
      .single();

    if (requesterProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Only GET supported for now
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // List users with email via Auth Admin API
    const { data: usersList, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;

    // Fetch all profiles and map by user_id
    const { data: profiles, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('user_id, display_name, role, is_creator, created_at');
    if (profErr) throw profErr;

    const profileMap = new Map<string, any>();
    for (const p of profiles || []) profileMap.set(p.user_id, p);

    const rows = (usersList?.users || []).map((u: any) => {
      const p = profileMap.get(u.id) || {};
      return {
        id: u.id,
        email: u.email,
        display_name: p.display_name ?? null,
        role: p.role ?? 'user',
        is_creator: p.is_creator ?? false,
        created_at: p.created_at ?? u.created_at,
      };
    });

    return new Response(JSON.stringify({ users: rows }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('admin-users error', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});