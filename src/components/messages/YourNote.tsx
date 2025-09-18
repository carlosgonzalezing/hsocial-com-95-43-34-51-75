import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

export const YourNote = () => {
  const { user } = useAuth();
  
  return (
    <div className="p-3 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="text-sm font-medium">
            {user?.user_metadata?.username?.[0] || user?.email?.[0] || 'T'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-medium text-sm text-foreground">Tu nota</div>
          <div className="text-xs text-muted-foreground">Publicar una nota...</div>
        </div>
      </div>
    </div>
  );
};