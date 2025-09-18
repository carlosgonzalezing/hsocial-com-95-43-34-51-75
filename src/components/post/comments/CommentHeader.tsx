
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/date-utils";

interface CommentHeaderProps {
  userId: string;
  profileData?: {
    username?: string;
    avatar_url?: string;
    id?: string;
  };
  timestamp: string;
  isReply?: boolean;
}

export function CommentHeader({ userId, profileData, timestamp, isReply = false }: CommentHeaderProps) {
  const username = profileData?.username || "Usuario";
  const avatarUrl = profileData?.avatar_url;
  const displayTime = formatRelativeTime(timestamp);

  return (
    <div className="flex flex-col items-center">
      <Avatar className={`${isReply ? 'h-6 w-6' : 'h-8 w-8'}`}>
        <AvatarImage src={avatarUrl || undefined} alt={username} />
        <AvatarFallback>{username[0]?.toUpperCase() || "U"}</AvatarFallback>
      </Avatar>
    </div>
  );
}
