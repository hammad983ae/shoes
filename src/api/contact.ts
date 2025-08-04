import { supabase } from '@/integrations/supabase/client';

export interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

export const submitContactRequest = async (contactData: ContactRequest) => {
  try {
    // Insert the contact request into Supabase
    const { data, error } = await supabase
      .from('contact_requests')
      .insert([contactData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Send email notification using Supabase Edge Function
    const emailResponse = await fetch('https://uvczawicaqqiyutcqoyg.supabase.co/functions/v1/send-contact-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2Y3phd2ljYXFxaXl1dGNxb3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjczNDAsImV4cCI6MjA2ODY0MzM0MH0.m3NCcH46Dfce34aVgEYbF08Bh_6rkMIDB6UF6z6xLLY',
      },
      body: JSON.stringify({
        name: contactData.name,
        email: contactData.email,
        message: contactData.message,
        requestId: data.id
      }),
    });

    if (!emailResponse.ok) {
      console.error('Failed to send email notification');
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error submitting contact request:', error);
    throw error;
  }
}; 