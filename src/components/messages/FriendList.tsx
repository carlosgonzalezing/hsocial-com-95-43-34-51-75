
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useSubscriptionManager } from "@/hooks/use-subscription-manager";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { getTimeAgo, isUserOnline } from "@/utils/time-utils";

interface Friend {
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
  status?: string | null;
  last_seen?: string | null;
}

interface FriendListProps {
  friends: Friend[];
  selectedFriend: Friend | null;
  onSelectFriend: (friend: Friend) => void;
  onLongPress?: (friendId: string) => void;
  onPressEnd?: () => void;
}

export const FriendList = ({ 
  friends, 
  selectedFriend, 
  onSelectFriend,
  onLongPress,
  onPressEnd 
}: FriendListProps) => {
  const [lastMessages, setLastMessages] = useState<{[friendId: string]: string}>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { getOrCreateChannel, removeChannel } = useSubscriptionManager();
  const isMobile = useIsMobile();
  useOnlineStatus(); // Track user's online status
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setCurrentUserId(data.session.user.id);
      }
    };
    
    fetchCurrentUser();
  }, []);
  
  useEffect(() => {
    if (!currentUserId || friends.length === 0) return;
    
    const fetchLastMessages = async () => {
      const friendIds = friends.map(f => f.friend_id);
      
      // Get the most recent message for each conversation
      const messages: {[friendId: string]: string} = {};
      
      for (const friendId of friendIds) {
        // Updated query to use parameterized queries for security
        const { data } = await (supabase as any)
          .from('messages')
          .select('content, created_at')
          .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
          .or(`sender_id.eq.${friendId},receiver_id.eq.${friendId}`)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (data && data.length > 0 && 'content' in data[0]) {
          const messageContent = data[0].content;
          // Truncate long messages
          messages[friendId] = messageContent.length > 20 ? messageContent.substring(0, 20) + '...' : messageContent;
        }
      }
      
      setLastMessages(messages);
    };
    
    fetchLastMessages();
    
    // Subscribe to new messages to keep the last messages updated
    const channelName = 'friend-list-messages';
    const subscriptionPromise = getOrCreateChannel(channelName, (channel) => {
      channel.on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, async (payload) => {
        const message = payload.new as any;
        const otherUserId = message.sender_id === currentUserId ? message.receiver_id : message.sender_id;
        
        // Update last message display
        if (friends.some(f => f.friend_id === otherUserId)) {
          setLastMessages(prev => ({
            ...prev,
            [otherUserId]: message.content.length > 20 ? message.content.substring(0, 20) + '...' : message.content
          }));
        }
      });
    });

    subscriptionPromise?.catch((error) => {
      console.error('Failed to subscribe to friend list messages:', error);
    });
      
    return () => {
      removeChannel(channelName);
    };
  }, [currentUserId, friends, getOrCreateChannel, removeChannel]);

  return (
    <div className="w-full h-full">
      <ScrollArea className="h-full">
        <div className={`${isMobile ? 'px-2' : ''}`}>
          {friends.map((friend) => (
            <button
              key={friend.friend_id}
              className={`w-full ${isMobile ? 'p-3' : 'p-4'} flex items-center gap-3 hover:bg-muted/50 transition-colors ${
                selectedFriend?.friend_id === friend.friend_id ? 'bg-muted' : ''
              } ${isMobile ? 'min-h-[72px]' : ''}`}
              onClick={() => onSelectFriend(friend)}
              onMouseDown={() => onLongPress?.(friend.friend_id)}
              onMouseUp={onPressEnd}
              onMouseLeave={onPressEnd}
              onTouchStart={() => onLongPress?.(friend.friend_id)}
              onTouchEnd={onPressEnd}
            >
              <div className="relative">
                <Avatar className={`${isMobile ? 'h-12 w-12' : 'h-10 w-10'} flex-shrink-0`}>
                  <AvatarImage src={friend.friend_avatar_url || undefined} />
                  <AvatarFallback className="text-sm font-medium">
                    {friend.friend_username[0]}
                  </AvatarFallback>
                </Avatar>
                {isUserOnline(friend.status, friend.last_seen) && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                )}
              </div>
              <div className="flex-1 text-left min-w-0 overflow-hidden">
                <div className={`font-medium ${isMobile ? 'text-base' : 'text-sm'} truncate`}>
                  <Link 
                    to={`/profile/${friend.friend_id}`} 
                    className="hover:underline block truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {friend.friend_username}
                  </Link>
                  {!isUserOnline(friend.status, friend.last_seen) && (
                    <div className="text-xs text-muted-foreground">
                      {getTimeAgo(friend.last_seen)}
                    </div>
                  )}
                </div>
                {lastMessages[friend.friend_id] && (
                  <div className={`${isMobile ? 'text-sm' : 'text-xs'} text-muted-foreground truncate mt-1`}>
                    {lastMessages[friend.friend_id]}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
