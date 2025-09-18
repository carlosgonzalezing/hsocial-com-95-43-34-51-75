
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Video, Phone, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Friend } from "@/hooks/use-friends";

interface ChatHeaderProps {
  friend?: Friend | null;
  isGroupChat?: boolean;
  onBack: () => void;
}

export const ChatHeader = ({ friend, isGroupChat = false, onBack }: ChatHeaderProps) => {
  return (
    <div className="h-14 px-4 bg-muted/30 border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {isGroupChat ? (
          <>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">H</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground text-sm leading-tight">Red H</div>
              <div className="text-xs text-muted-foreground leading-tight">Chat grupal</div>
            </div>
          </>
        ) : friend && (
          <>
            <Avatar className="h-9 w-9">
              <AvatarImage src={friend.friend_avatar_url || undefined} />
              <AvatarFallback className="text-sm font-medium">{friend.friend_username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground text-sm leading-tight">{friend.friend_username}</div>
              <div className="text-xs text-green-500 leading-tight">en línea</div>
            </div>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
