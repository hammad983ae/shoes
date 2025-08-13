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

    // MOCK RESPONSE since Chiron API doesn't exist
    console.log('🎭 Generating mock payment token since Chiron API is not available');
    
    const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('✅ Mock payment token generated successfully:', {
      tokenId: mockToken,
      amount: amount,
      itemCount: items?.length || 0
    });

    const successResponse = { 
      token: mockToken,
      amount: amount,
      mock: true,
      message: 'This is a mock token - Chiron API not available'
    };

    console.log('📤 Returning mock success response:', successResponse);

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