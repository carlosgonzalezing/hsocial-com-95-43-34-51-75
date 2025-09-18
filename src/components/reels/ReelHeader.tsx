
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { type Reel } from "@/types/reel";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface ReelHeaderProps {
  reel: Reel;
  isFullscreen: boolean;
}

export function ReelHeader({ reel, isFullscreen }: ReelHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleUserClick = () => {
    navigate(`/profile/${reel.user.id}`);
  };
  
  return (
    <div className="absolute top-0 left-0 right-0 z-10 p-4">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={handleUserClick}
        >
          <Avatar className="h-8 w-8 border border-white/20">
            <AvatarImage src={reel.user.avatar_url || undefined} />
            <AvatarFallback>{reel.user.username?.[0]}</AvatarFallback>
          </Avatar>
          <div className="text-white text-shadow">
            <p className="text-sm font-medium">{reel.user.username}</p>
          </div>
        </div>
        
        {/* Only show close button for fullscreen on desktop (not mobile to avoid duplication) */}
        {isFullscreen && !isMobile && (
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 rounded-full bg-black/20 text-white hover:bg-black/40"
            onClick={() => document.exitFullscreen()}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
