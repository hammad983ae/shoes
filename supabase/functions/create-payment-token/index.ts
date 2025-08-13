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

    console.log('Create payment token request:', { amount, itemCount: items?.length || 0 });

    if (!amount || amount <= 0) {
      console.error('Invalid amount provided:', amount);
      throw new Error('Invalid amount');
    }

    console.log('Calling Chiron API with amount:', amount);

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

    console.log('Chiron API response status:', chironResponse.status);

    if (!chironResponse.ok) {
      const errorText = await chironResponse.text();
      console.error('Chiron API error response:', {
        status: chironResponse.status,
        statusText: chironResponse.statusText,
        errorText: errorText
      });
      throw new Error(`Failed to generate payment token: ${chironResponse.status} - ${errorText}`);
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