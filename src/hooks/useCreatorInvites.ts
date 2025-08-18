import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CreatorInvite {
  id: string;
  email: string;
  display_name?: string | null;
  coupon_code: string;
  tier: string | null;
  status: string | null;
  tiktok_username?: string | null;
  followers: number | null;
  starting_credits: number | null;
  notes?: string | null;
  created_at: string | null;
  updated_at: string | null;
  invite_token: string;
}

export const useCreatorInvites = () => {
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<CreatorInvite[]>([]);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('creator_invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvites(data || []);
    } catch (error) {
      console.error('Error fetching creator invites:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInvite = async (inviteData: Omit<CreatorInvite, 'id' | 'created_at' | 'updated_at' | 'invite_token'>) => {
    try {
      const { data, error } = await supabase
        .from('creator_invites')
        .insert([{
          ...inviteData,
          invite_token: crypto.randomUUID()
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchInvites(); // Refresh the list
      return { success: true, data };
    } catch (error) {
      console.error('Error creating invite:', error);
      return { success: false, error };
    }
  };

  const updateInviteStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('creator_invites')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      await fetchInvites(); // Refresh the list
      return { success: true };
    } catch (error) {
      console.error('Error updating invite status:', error);
      return { success: false, error };
    }
  };

  const deleteInvite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('creator_invites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchInvites(); // Refresh the list
      return { success: true };
    } catch (error) {
      console.error('Error deleting invite:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  return {
    loading,
    invites,
    createInvite,
    updateInviteStatus,
    deleteInvite,
    refetch: fetchInvites
  };
};