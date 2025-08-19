import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreatorInviteRequest {
  email: string;
  display_name?: string;
  tier: string;
  coupon_code: string;
  starting_credits: number;
  tiktok_username?: string;
  followers: number;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Creator invite function called');

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { 
      email, 
      display_name, 
      tier, 
      coupon_code, 
      starting_credits, 
      tiktok_username, 
      followers, 
      notes 
    }: CreatorInviteRequest = await req.json();

    console.log('Processing creator invite for:', email);

    // Generate a unique invite token
    const inviteToken = crypto.randomUUID();
    
    // Store the invite in the database
    const { data: inviteData, error: inviteError } = await supabase
      .from('creator_invites')
      .insert([{
        email,
        display_name,
        tier,
        coupon_code,
        starting_credits,
        tiktok_username,
        followers,
        notes,
        invite_token: inviteToken,
        status: 'pending'
      }])
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invite:', inviteError);
      throw inviteError;
    }

    // Create the magic link URL
    const redirectUrl = `${Deno.env.get('SUPABASE_URL')?.replace('//', '//').split('/')[2].includes('supabase.co') 
      ? 'https://cralluxsells.com' 
      : 'http://localhost:3000'}/creator-signup?token=${inviteToken}`;

    console.log('Redirect URL:', redirectUrl);

    // Send the email using the provided HTML template
    const emailHtml = `
<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">
  <head>
    <meta charset="UTF-8" />
    <title>Your Crallux Creator Magic Link</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body { background-color:#101010; color:#f0f0f0; margin:0; padding:0; font-family:'Inter', Arial, sans-serif; }
      .container { max-width:540px; margin:0 auto; background-color:#212121; border-radius:12px; overflow:hidden; box-shadow:0 0 16px rgba(255,214,0,0.15); border:1px solid #2f2f2f; }
      .header { background-color:#101010; padding:32px 24px 16px; text-align:center; }
      .header h1 { color:#FFD600; font-size:24px; margin-bottom:8px; }
      .content { padding:24px; font-size:15px; line-height:1.6; color:#f0f0f0; }
      .footer { text-align:center; padding:24px 16px; font-size:13px; color:#999; background-color:#101010; border-top:1px solid #2a2a2a; }
      .footer a { color:#FFD600 !important; text-decoration:none; }
    </style>
  </head>
  <body style="background-color:#101010; color:#f0f0f0; margin:0; padding:0; font-family:'Inter', Arial, sans-serif;">
    <div class="container" style="max-width:540px; margin:0 auto; background-color:#212121; border-radius:12px; overflow:hidden; box-shadow:0 0 16px rgba(255,214,0,0.15); border:1px solid #2f2f2f;">
      <div class="header" style="background-color:#101010; padding:32px 24px 16px; text-align:center;">
        <h1 style="color:#FFD600; font-size:24px; margin:0 0 8px 0;">Creator Magic Link</h1>
        <p style="margin:0; font-size:14px; color:#ccc;">Join the Crallux creator program.</p>
      </div>

      <div class="content" style="padding:24px; font-size:15px; line-height:1.6; color:#f0f0f0;">
        <p style="margin:0 0 12px 0; color:#f0f0f0;">Hey there,</p>
        <p style="margin:0 0 12px 0; color:#f0f0f0;">
          You've been invited to join Crallux as a creator! Tap the button below to get started with your creator account.
        </p>

        <a href="${redirectUrl}"
           style="display:inline-block; margin-top:24px; padding:14px 28px; background-color:#FFD600; color:#101010 !important; text-decoration:none; font-weight:600; font-size:15px; border-radius:8px;">
          Join as Creator
        </a>

        <p style="font-size:13px; color:#bbb; margin:24px 0 0 0;">
          Or paste this link into your browser if the button doesn't work:<br />
          <a href="${redirectUrl}" style="color:#FFD600 !important; text-decoration:none;">${redirectUrl}</a>
        </p>
      </div>

      <div class="footer" style="text-align:center; padding:24px 16px; font-size:13px; color:#999; background-color:#101010; border-top:1px solid #2a2a2a;">
        © 2025 Crallux Sells<br />
        <a href="https://cralluxsells.com/terms" style="color:#FFD600 !important; text-decoration:none;">Terms</a> ·
        <a href="https://cralluxsells.com/privacy" style="color:#FFD600 !important; text-decoration:none;">Privacy</a> ·
        <a href="mailto:cralluxmaster@protonmail.com" style="color:#FFD600 !important; text-decoration:none;">Support</a>
      </div>
    </div>
  </body>
</html>`;

    const emailResponse = await resend.emails.send({
      from: "Crallux <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Crallux Creator Program!",
      html: emailHtml,
    });

    console.log("Creator invite email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        inviteId: inviteData.id,
        message: `Creator invite sent to ${email}` 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-creator-invite function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);