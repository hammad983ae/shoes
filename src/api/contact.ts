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
    const emailResponse = await fetch(`${supabase.supabaseUrl}/functions/v1/send-contact-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`,
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