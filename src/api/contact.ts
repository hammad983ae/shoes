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
    const { error: edgeError } = await supabase.functions.invoke('send-contact-email', {
      body: {
        name: contactData.name,
        email: contactData.email,
        message: contactData.message,
        requestId: data.id
      }
    });

    if (edgeError) {
      console.error('Failed to send email notification:', edgeError);
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error submitting contact request:', error);
    throw error;
  }
}; 