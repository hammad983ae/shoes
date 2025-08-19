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
    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, role, is_creator } = await req.json()
    
    console.log(`Promoting user ${email} to role: ${role}, creator: ${is_creator}`)

    // First, find the user by email in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching users:', authError)
      throw authError
    }

    const targetUser = authUsers.users.find(user => user.email === email)
    
    if (!targetUser) {
      return new Response(
        JSON.stringify({ error: `User with email ${email} not found` }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found user ID: ${targetUser.id}`)

    // Use raw SQL through RPC to bypass triggers
    const { data: updateResult, error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.profiles 
        SET 
          role = $1,
          is_creator = $2,
          commission_rate = CASE WHEN $2 = true THEN 0.15 ELSE commission_rate END,
          creator_tier = CASE WHEN $2 = true THEN 'tier2' ELSE creator_tier END,
          updated_at = now()
        WHERE user_id = $3
      `,
      args: [role, is_creator, targetUser.id]
    })

    if (updateError) {
      // If RPC doesn't work, try direct update with different approach
      console.log('RPC failed, trying direct update...')
      
      const { error: directError } = await supabase
        .from('profiles')
        .update({
          role: role,
          is_creator: is_creator,
          commission_rate: is_creator ? 0.15 : undefined,
          creator_tier: is_creator ? 'tier2' : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', targetUser.id)

      if (directError) {
        console.error('Direct update failed:', directError)
        throw directError
      }
    }

    // Generate coupon code if user is now a creator
    if (is_creator) {
      // Check if user already has a coupon code
      const { data: profile } = await supabase
        .from('profiles')
        .select('coupon_code')
        .eq('user_id', targetUser.id)
        .single()

      if (!profile?.coupon_code) {
        // Generate a simple coupon code
        const couponCode = Math.random().toString(36).substring(2, 10).toUpperCase()
        
        await supabase
          .from('profiles')
          .update({ coupon_code: couponCode })
          .eq('user_id', targetUser.id)

        // Add to coupon_codes table
        await supabase
          .from('coupon_codes')
          .insert({
            creator_id: targetUser.id,
            code: couponCode
          })
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