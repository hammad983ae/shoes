import { supabase } from '@/integrations/supabase/client';

export interface NewMessagePayload {
  name: string;
  email: string;
  message: string;
  honeypot?: string;
}

export const submitMessage = async (payload: NewMessagePayload) => {
  const { data, error } = await supabase.functions.invoke('submit-message', {
    body: payload,
  });
  if (error) throw error;
  return data;
};
