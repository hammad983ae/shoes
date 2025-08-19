import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from 'https://esm.sh/resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, message, requestId } = await req.json()

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Resend with API key from environment
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    // Send confirmation email to user
    const senderEmail = Deno.env.get("SENDER_EMAIL") || "no-reply@cralluxsells.com";
    const userEmailResult = await resend.emails.send({
      from: `Crallux <${senderEmail}>`,
      to: email,
      reply_to: [email],
      subject: 'We received your message - Crallux',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FFD700;">Thank you for contacting Crallux!</h2>
          <p>Hi ${name},</p>
          <p>We've received your message and will get back to you as soon as possible.</p>
          <p><strong>Your message:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #FFD700; margin: 20px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p>We'll respond to this email thread with our reply.</p>
          <p>Best regards,<br>The Crallux Team</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            Request ID: ${requestId}<br>
            Sent on: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    })

    // Send notification email to admin (BCC)
    const adminEmailResult = await resend.emails.send({
      from: `Crallux Contact Form <${senderEmail}>`,
      to: 'cralluxmaster@protonmail.com',
      reply_to: [email],
      subject: `New Contact Request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FFD700;">New Contact Request</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Request ID:</strong> ${requestId}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #FFD700; margin: 20px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    })

    if (userEmailResult.error || adminEmailResult.error) {
      console.error('Email sending failed:', userEmailResult.error || adminEmailResult.error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact request submitted and email sent successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-contact-email function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 