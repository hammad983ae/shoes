import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  order_id: string;
  customer_name: string;
  product_names: string[];
  order_total: number;
  status: string;
  created_at: string;
}

const generateHmacSignature = async (payload: string, secret: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload)
  );
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.substring(7)
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

    // Verify this is system/admin access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payload: WebhookPayload = await req.json()
    const webhookUrl = Deno.env.get('WEBHOOK_URL')
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET')
    
    if (!webhookUrl || !webhookSecret) {
      console.error('Missing webhook configuration')
      return new Response(
        JSON.stringify({ error: 'Webhook not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payloadText = JSON.stringify(payload)
    const signature = await generateHmacSignature(payloadText, webhookSecret)

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': `sha256=${signature}`,
        'User-Agent': 'Supabase-Webhook/1.0'
      },
      body: payloadText
    })

    if (!webhookResponse.ok) {
      console.error('Webhook failed:', await webhookResponse.text())
      throw new Error(`Webhook failed: ${webhookResponse.status}`)
    }

    console.log('Webhook sent successfully for order:', payload.order_id)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})