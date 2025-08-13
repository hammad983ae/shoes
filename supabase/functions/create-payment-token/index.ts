import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🚀 create-payment-token function starting...');

serve(async (req) => {
  console.log('📥 Request received:', req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Returning CORS headers for preflight');
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🔄 Processing payment token request...');

  try {
    console.log('📄 Reading request body...');
    const requestBody = await req.text();
    console.log('📄 Raw request body:', requestBody);
    
    const { amount, items } = JSON.parse(requestBody);
    console.log('💰 Create payment token request:', { amount, itemCount: items?.length || 0 });

    if (!amount || amount <= 0) {
      console.error('❌ Invalid amount provided:', amount);
      throw new Error('Invalid amount - must be greater than 0');
    }

    console.log('🌐 Calling Chiron API with amount:', amount);

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

    console.log('📡 Chiron API response status:', chironResponse.status, chironResponse.statusText);

    if (!chironResponse.ok) {
      const errorText = await chironResponse.text();
      console.error('❌ Chiron API error response:', {
        status: chironResponse.status,
        statusText: chironResponse.statusText,
        errorText: errorText
      });
      throw new Error(`Chiron API failed: ${chironResponse.status} - ${errorText}`);
    }

    const chironData = await chironResponse.json();
    console.log('✅ Payment token generated successfully:', {
      tokenId: chironData.id,
      amount: amount,
      itemCount: items?.length || 0
    });

    const successResponse = { 
      token: chironData.id,
      amount: amount
    };

    console.log('📤 Returning success response:', successResponse);

    return new Response(
      JSON.stringify(successResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 Error in create-payment-token:', error);
    console.error('💥 Error stack:', error.stack);
    
    const errorResponse = { 
      error: error.message || 'Failed to generate payment token',
      details: error.stack || 'No stack trace available'
    };
    
    console.log('📤 Returning error response:', errorResponse);
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});