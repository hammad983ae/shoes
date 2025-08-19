import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CouponCode {
  code: string;
  isActive: boolean;
  totalUses: number;
  totalUsedAmount: number;
  createdAt: string;
}

export const useCouponCode = (userId?: string) => {
  const [couponCode, setCouponCode] = useState<CouponCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCouponCode = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First check the coupon_codes table (authoritative source)
      const { data: couponData, error: couponError } = await supabase
        .from('coupon_codes')
        .select('*')
        .eq('creator_id', userId)
        .maybeSingle();

      if (couponError) {
        console.error('Error fetching coupon code:', couponError);
        setError(couponError.message);
        return;
      }

      if (couponData) {
        setCouponCode({
          code: couponData.code,
          isActive: couponData.is_active || false,
          totalUses: couponData.total_uses || 0,
          totalUsedAmount: couponData.total_used_amount || 0,
          createdAt: couponData.created_at || new Date().toISOString()
        });
      } else {
        // Fallback to profiles table if no coupon in coupon_codes table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('coupon_code')
          .eq('user_id', userId)
          .single();

        if (profileError) {
          console.error('Error fetching profile coupon code:', profileError);
          setError(profileError.message);
          return;
        }

        if (profileData?.coupon_code) {
          setCouponCode({
            code: profileData.coupon_code,
            isActive: true,
            totalUses: 0,
            totalUsedAmount: 0,
            createdAt: new Date().toISOString()
          });
        } else {
          setCouponCode(null);
        }
      }
    } catch (err) {
      console.error('Error in useCouponCode:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateCouponCode = async (newCode: string) => {
    if (!userId) return { success: false, error: 'User ID required' };

    try {
      setLoading(true);

      // Use the admin function to set the coupon code
      const { data, error } = await supabase.rpc('admin_set_coupon_code', {
        target_user_id: userId,
        new_code: newCode.trim().toUpperCase()
      });

      if (error) {
        console.error('Error updating coupon code:', error);
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Type assertion for the RPC response
      const result = data as { success?: boolean; error?: string } | null;

      if (!result?.success) {
        const errorMsg = result?.error || 'Failed to update coupon code';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Refresh the coupon code data
      await fetchCouponCode();
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error updating coupon code:', err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponCode();
  }, [userId]);

  return {
    couponCode,
    loading,
    error,
    updateCouponCode,
    refetch: fetchCouponCode
  };
};