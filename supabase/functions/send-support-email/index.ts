import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  name: string;
  email: string;
  issue_type: string;
  message: string;
}

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
    // Reset limit every 5 minutes
    rateLimitStore.set(identifier, { count: 1, resetTime: now + 300000 });
    return false;
  }
  
  if (limit.count >= 3) { // 3 requests per 5 minutes
    return true;
  }
  
  limit.count++;
  return false;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    
    // Rate limiting
    if (isRateLimited(clientIP)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, issue_type, message }: SupportEmailRequest = await req.json();

    // Validate required fields
    if (!name || !email || !issue_type || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send confirmation email to user
    const senderEmail = Deno.env.get("SENDER_EMAIL") || "no-reply@cralluxsells.com";
    const userEmailResponse = await resend.emails.send({
      from: `Crallux Sells Support <${senderEmail}>`,
      to: [email],
      reply_to: [email],
      subject: `Ticket Received: ${issue_type}`,
      html: `
        <h1>Hi ${name},</h1>
        <p>We've received your message about "<strong>${issue_type}</strong>" and will get back to you shortly.</p>
        
        <h3>Here's what you sent:</h3>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          "${message}"
        </div>
        
        <p>— Crallux Sells Support</p>
        
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          If you have any urgent questions, you can also reach us at cralluxmaster@protonmail.com
        </p>
      `,
    });

    // Send notification email to company
    const companyEmailResponse = await resend.emails.send({
      from: `Crallux Sells Support <${senderEmail}>`,
      to: ["cralluxmaster@protonmail.com"],
      reply_to: [email],
      subject: `New Support Ticket: ${issue_type} - ${name}`,
      html: `
        <h1>New Support Ticket Received</h1>
        
        <h3>Customer Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Issue Type:</strong> ${issue_type}</li>
        </ul>
        
        <h3>Message:</h3>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          ${message}
        </div>
        
        <p>Please respond to the customer at: <a href="mailto:${email}">${email}</a></p>
      `,
    });

    console.log("Support emails sent successfully:", { userEmailResponse, companyEmailResponse });

    return new Response(
      JSON.stringify({ 
        success: true, 
        userEmail: userEmailResponse,
        companyEmail: companyEmailResponse 
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
    console.error("Error in send-support-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);