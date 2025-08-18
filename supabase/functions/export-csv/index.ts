import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { type, filters = {} } = await req.json()

    let data: any[] = []
    let filename = 'export.csv'

    switch (type) {
      case 'users':
        const { data: users } = await supabase
          .from('profiles')
          .select(`
            user_id,
            display_name,
            role,
            is_creator,
            coupon_code,
            credits,
            created_at,
            total_spent,
            last_login_at
          `)
          .order('created_at', { ascending: false })
        
        data = users || []
        filename = 'users_export.csv'
        break

      case 'orders':
        const { data: orders } = await supabase
          .from('orders')
          .select(`
            id,
            user_id,
            order_total,
            status,
            coupon_code,
            creator_id,
            commission_amount_at_purchase,
            created_at,
            tracking_number,
            estimated_delivery
          `)
          .order('created_at', { ascending: false })
        
        data = orders || []
        filename = 'orders_export.csv'
        break

      case 'products':
        const { data: products } = await supabase
          .from('products')
          .select(`
            id,
            title,
            brand,
            category,
            price,
            stock,
            infinite_stock,
            limited,
            availability,
            created_at
          `)
          .order('created_at', { ascending: false })
        
        data = products || []
        filename = 'products_export.csv'
        break

      case 'campaigns':
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false })
        
        data = campaigns || []
        filename = 'campaigns_export.csv'
        break

      default:
        throw new Error('Invalid export type')
    }

    if (data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No data found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Convert to CSV
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value ?? ''
        }).join(',')
      )
    ].join('\n')

    return new Response(csvContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('CSV Export error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})