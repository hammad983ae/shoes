import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  referrals_count: number;
  earned_from_referrals: number;
}

interface LeaderboardData {
  topUsers: LeaderboardUser[];
  currentUserRank: number;
  currentUserStats: LeaderboardUser | null;
  loading: boolean;
  error: string | null;
}

export const useLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    topUsers: [],
    currentUserRank: 0,
    currentUserStats: null,
    loading: true,
    error: null
  });

  const fetchLeaderboardData = async () => {
    if (!user) return;

    try {
      setLeaderboardData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch top profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, referrals_count')
        .not('referrals_count', 'is', null)
        .limit(1000);

      if (profilesError) throw profilesError;

      const userIds = profiles.map(u => u.user_id);

      // Fetch matching credits
      const { data: credits, error: creditsError } = await supabase
        .from('user_credits')
        .select('user_id, earned_from_referrals')
        .in('user_id', userIds);

      if (creditsError) throw creditsError;

      const creditsMap = new Map(credits.map(c => [c.user_id, c.earned_from_referrals]));

      const mergedUsers: LeaderboardUser[] = profiles.map(user => ({
        id: user.user_id,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        referrals_count: user.referrals_count || 0,
        earned_from_referrals: creditsMap.get(user.user_id) || 0
      }));

      // Sort by referrals_count first, then earned_from_referrals
      mergedUsers.sort((a, b) => {
        if (b.referrals_count === a.referrals_count) {
          return b.earned_from_referrals - a.earned_from_referrals;
        }
        return b.referrals_count - a.referrals_count;
      });

      // Top 10
      const topUsers = mergedUsers.slice(0, 10);

      // Current user info
      const currentUserIndex = mergedUsers.findIndex(u => u.id === user.id);
      const currentUserRank = currentUserIndex >= 0 ? currentUserIndex + 1 : 0;
      const currentUserStats = currentUserIndex >= 0 ? mergedUsers[currentUserIndex] : null;

      setLeaderboardData({
        topUsers,
        currentUserRank,
        currentUserStats,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setLeaderboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load leaderboard data'
      }));
    }
  };

  useEffect(() => {
    if (user) {
      fetchLeaderboardData();
    }
  }, [user]);

  return {
    ...leaderboardData,
    refetch: fetchLeaderboardData
  };
};
