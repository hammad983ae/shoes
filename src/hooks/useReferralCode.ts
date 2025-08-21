import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useReferralCode = () => {
  const { session } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReferralCode = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // 2. Use RPC to get referral code
      const { data, error } = await supabase.rpc('get_my_referral_code');

      if (error) throw error;
      setReferralCode(data);
    } catch (err: any) {
      console.error('Error fetching referral code:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // 2. Use RPC to generate referral code
      const { data, error } = await supabase.rpc('generate_my_referral_code');

      if (error) throw error;
      setReferralCode(data);
      return data;
    } catch (err: any) {
      console.error('Error generating referral code:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOrCreateReferralCode = async () => {
    await fetchReferralCode();
    if (!referralCode) {
      return await generateReferralCode();
    }
    return referralCode;
  };

  useEffect(() => {
    fetchReferralCode();
  }, [session?.user?.id]);

  const clearReferralCode = () => {
    setReferralCode(null);
  };

  const setReferralCodeFromUrl = (code: string) => {
    setReferralCode(code);
  };

  return {
    referralCode,
    loading,
    error,
    generateReferralCode,
    getOrCreateReferralCode,
    clearReferralCode,
    setReferralCodeFromUrl,
    refetch: fetchReferralCode
  };
};