import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract JWT token from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Create Supabase client with user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      }
    )

    // Verify admin access using the authenticated user
    const { data: adminCheck, error: adminError } = await supabase.rpc('is_admin')
    
    if (adminError || !adminCheck) {
      console.log('Unauthorized access attempt')
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email, role, is_creator } = await req.json()
    
    console.log(`Admin promoting user ${email} to role: ${role}, creator: ${is_creator}`)

    // Find the target user by email using admin RPC
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .eq('user_id', supabase.auth.getUser().then(res => res.data.user?.email === email ? res.data.user.id : null))
      .single()

    // Alternative: Find user by checking auth.users via email lookup
    const { data: authUser, error: authError } = await supabase.rpc('admin_find_user_by_email', { user_email: email })
    
    if (authError) {
      console.error('Error finding user:', authError)
      return new Response(
        JSON.stringify({ error: `User with email ${email} not found` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const targetUserId = authUser?.user_id
    
    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: `User with email ${email} not found` }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found user ID: ${targetUserId}`)

    // Use secure admin RPC function instead of raw SQL
    const { data: updateResult, error: updateError } = await supabase.rpc('admin_set_creator_status', {
      target_user_id: targetUserId,
      is_creator_status: is_creator,
      new_role: role
    })

    if (updateError) {
      console.error('Admin update failed:', updateError)
      throw updateError
    }

    // Generate coupon code if user is now a creator
    if (is_creator) {
      // Check if user already has a coupon code
      const { data: profile } = await supabase
        .from('profiles')
        .select('coupon_code')
        .eq('user_id', targetUserId)
        .single()

      if (!profile?.coupon_code) {
        // Generate a simple coupon code using admin RPC
        const couponCode = Math.random().toString(36).substring(2, 10).toUpperCase()
        
        const { error: couponError } = await supabase.rpc('admin_set_coupon_code', {
          target_user_id: targetUserId,
          new_code: couponCode
        })

        if (couponError) {
          console.warn('Failed to set coupon code:', couponError)
        }
      }
    }

    console.log(`Successfully updated user ${email}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${email} promoted to ${role}${is_creator ? ' and creator' : ''}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error promoting user:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})