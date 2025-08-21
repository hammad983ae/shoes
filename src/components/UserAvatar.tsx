import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export function UserAvatar({ 
  avatarUrl, 
  displayName, 
  size = 'md',
  className = '' 
}: UserAvatarProps) {
  const fallbackInitial = displayName?.[0]?.toUpperCase() || 'U';
  
  return (
    <Avatar className={className || sizeClasses[size]}>
      <AvatarImage src={avatarUrl || undefined} />
      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
        {fallbackInitial}
      </AvatarFallback>
    </Avatar>
  );
}