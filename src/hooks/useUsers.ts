import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  user_id: string;
  display_name: string;
  email?: string;
  role: string;
  is_creator: boolean;
  creator_tier: string;
  commission_rate: number;
  referrals_count: number;
  credits: number;
  coupon_code?: string;
  total_spent: number;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

interface UserSummary {
  totalUsers: number;
  activeUsers: number;
  creators: number;
  newThisMonth: number;
  avgLTV: number;
}

export const useUsers = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] = useState<UserSummary>({
    totalUsers: 0,
    activeUsers: 0,
    creators: 0,
    newThisMonth: 0,
    avgLTV: 0
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data: usersData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers: User[] = (usersData || []).map(user => ({
        id: user.id,
        user_id: user.user_id,
        display_name: user.display_name || 'Anonymous',
        role: user.role,
        is_creator: user.is_creator,
        creator_tier: user.creator_tier || 'tier1',
        commission_rate: user.commission_rate || 0.1,
        referrals_count: user.referrals_count || 0,
        credits: user.credits || 0,
        coupon_code: user.coupon_code || undefined,
        total_spent: user.total_spent || 0,
        last_login_at: user.last_login_at || undefined,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));

      setUsers(formattedUsers);

      // Calculate summary
      const totalUsers = formattedUsers.length;
      const creators = formattedUsers.filter(u => u.is_creator).length;
      
      // Calculate new users this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const newThisMonth = formattedUsers.filter(u => 
        new Date(u.created_at) >= thisMonth
      ).length;

      // Calculate LTV only for paying customers (users with total_spent > 0)
      const payingCustomers = formattedUsers.filter(u => u.total_spent > 0);
      const avgLTV = payingCustomers.length > 0 
        ? payingCustomers.reduce((sum, user) => sum + user.total_spent, 0) / payingCustomers.length 
        : 0;

      setSummary({
        totalUsers,
        activeUsers: totalUsers, // Simplified - would need activity tracking
        creators,
        newThisMonth,
        avgLTV
      });

    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string, isCreator: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role,
          is_creator: isCreator
        })
        .eq('user_id', userId);

      if (error) throw error;

      await fetchUsers(); // Refresh the list
      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      return { success: false, error };
    }
  };

  const setCouponCode = async (userId: string, couponCode: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ coupon_code: couponCode })
        .eq('user_id', userId);

      if (error) throw error;

      await fetchUsers(); // Refresh the list
      return { success: true };
    } catch (error) {
      console.error('Error setting coupon code:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    loading,
    users,
    summary,
    updateUserRole,
    setCouponCode,
    refetch: fetchUsers
  };
};