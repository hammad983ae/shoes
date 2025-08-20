import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIP(req: Request): string {
  return req.headers.get('cf-connecting-ip') || 
         req.headers.get('x-forwarded-for')?.split(',')[0] || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(identifier);
  
  if (!limit || now > limit.resetTime) {
    // Reset limit every minute
    rateLimitStore.set(identifier, { count: 1, resetTime: now + 60000 });
    return false;
  }
  
  if (limit.count >= 3) { // Reduced to 3 requests per minute
    return true;
  }
  
  limit.count++;
  return false;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    
    // Rate limiting
    if (isRateLimited(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { prompt, context, messages } = await req.json();

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (prompt.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Prompt too long (max 1000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    // Sanitize and limit conversation history
    const sanitizedMessages = (messages || []).slice(-10).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: String(msg.content || '').substring(0, 500)
    }));

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://cralluxsells.com',
        'X-Title': 'Crallux Sells',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free',
        messages: [
          { role: 'system', content: context || 'You are a helpful assistant for Crallux Sells.' },
          ...sanitizedMessages,
          { role: 'user', content: prompt }
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    let aiText = data.choices?.[0]?.message?.content || 'Sorry, I could not get a response.';
    
    // Strip thinking blocks and sanitize response
    aiText = aiText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    if (!aiText) {
      aiText = 'Sorry, I could not get a response.';
    }

    // Basic content filtering
    if (aiText.length > 2000) {
      aiText = aiText.substring(0, 2000) + '...';
    }

    return new Response(JSON.stringify({ 
      success: true,
      response: aiText 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});