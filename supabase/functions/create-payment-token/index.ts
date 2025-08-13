import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    const { amount, items } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    // Call Chiron API to generate payment token
    const chironResponse = await fetch('https://api.chironapp.io/api/transactions/token/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 695d0dfe-ff14-49b5-80df-40a06195a27b'
      },
      body: JSON.stringify({
        amount: amount
      })
    });

    if (!chironResponse.ok) {
      const errorText = await chironResponse.text();
      console.error('Chiron API error:', errorText);
      throw new Error(`Failed to generate payment token: ${chironResponse.status}`);
    }

    const chironData = await chironResponse.json();

    console.log('Payment token generated successfully:', {
      tokenId: chironData.id,
      amount: amount,
      itemCount: items?.length || 0
    });

    return new Response(
      JSON.stringify({ 
        token: chironData.id,
        amount: amount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-payment-token:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate payment token' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});