import { supabase } from '@/integrations/supabase/client';

export interface ProfileWithCredits {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string | null;
  is_creator: boolean | null;
  credits: number;
}

export async function getMyProfileWithCredits(): Promise<ProfileWithCredits> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('v_profile_full')
    .select('user_id, display_name, avatar_url, bio, role, is_creator, credits')
    .eq('user_id', user.id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_balances')
    .select('available')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data.available;
}

export async function spendCredits(amount: number, reason: string, meta: any = {}): Promise<void> {
  const { error } = await supabase.rpc('spend_credits', { amount, reason, meta });
  if (error) throw error;
}

export async function grantCreditsAdmin(userId: string, amount: number, reason: string, meta: any = {}): Promise<void> {
  const { error } = await supabase.rpc('grant_credits_admin', { target_user: userId, amount, reason, meta });
  if (error) throw error;
}