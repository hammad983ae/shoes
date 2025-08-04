import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import LeaderboardRow from './LeaderboardRow';

const ReferralLeaderboard: React.FC = () => {
  const { topUsers, currentUserRank, currentUserStats, loading, error } = useLeaderboard();
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const currentUserRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current user's position if they're in top 10
  useEffect(() => {
    if (currentUserRank <= 10 && currentUserRef.current && leaderboardRef.current) {
      currentUserRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentUserRank, topUsers]);

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Referral Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Referral Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-400">
            <p>Failed to load leaderboard</p>
            <p className="text-sm text-gray-400 mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Referral Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Top 10 Users */}
          <div 
            ref={leaderboardRef}
            className="max-h-96 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
          >
            {topUsers.map((user, index) => (
              <div
                key={user.id}
                ref={user.id === currentUserStats?.id ? currentUserRef : null}
              >
                <LeaderboardRow
                  position={index + 1}
                  user={user}
                  isCurrentUser={user.id === currentUserStats?.id}
                />
              </div>
            ))}
          </div>

          {/* Current User's Position (if not in top 10) */}
          {currentUserStats && currentUserRank > 10 && (
            <div className="pt-4 border-t border-gray-700">
              <div className="text-center mb-3">
                <p className="text-sm text-gray-400">Your Position</p>
              </div>
              <LeaderboardRow
                position={currentUserRank}
                user={currentUserStats}
                isCurrentUser={true}
              />
            </div>
          )}

          {/* Empty State */}
          {topUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No referrals yet</p>
              <p className="text-sm text-gray-500 mt-2">Start sharing your referral link!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralLeaderboard; 