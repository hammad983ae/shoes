import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Coins } from 'lucide-react';

interface LeaderboardRowProps {
  position: number;
  user: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    referrals_count: number;
    earned_from_referrals: number;
  };
  isCurrentUser?: boolean;
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ position, user, isCurrentUser = false }) => {
  const getPositionColor = (pos: number) => {
    switch (pos) {
      case 1:
        return 'text-yellow-400 font-bold'; // Gold
      case 2:
        return 'text-gray-300 font-bold'; // Silver
      case 3:
        return 'text-amber-600 font-bold'; // Bronze
      default:
        return 'text-gray-400'; // Normal
    }
  };

  const getPositionBg = (pos: number) => {
    switch (pos) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-500/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30';
      default:
        return 'bg-gray-800/50 border-gray-700';
    }
  };

  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg border transition-all duration-200
      ${getPositionBg(position)}
      ${isCurrentUser ? 'ring-2 ring-yellow-500/50 shadow-lg' : ''}
      hover:bg-gray-700/50 hover:border-gray-600
    `}>
      {/* Position Number */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
        ${getPositionColor(position)}
        ${position <= 3 ? 'bg-gray-800/80' : 'bg-gray-700/80'}
      `}>
        #{position}
      </div>

      {/* Avatar */}
      <Avatar className="w-10 h-10 border-2 border-gray-600 flex-shrink-0">
        <AvatarImage src={user.avatar_url || undefined} />
        <AvatarFallback className="bg-gray-600 text-white text-sm font-bold">
          {user.display_name?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white truncate">
            {user.display_name || 'Anonymous User'}
          </span>
          {isCurrentUser && (
            <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">
              YOU
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-gray-300">
          <Users className="w-4 h-4" />
          <span className="font-semibold">{user.referrals_count}</span>
        </div>
        <div className="flex items-center gap-1 text-yellow-400">
          <Coins className="w-4 h-4" />
          <span className="font-semibold">{user.earned_from_referrals}</span>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardRow; 