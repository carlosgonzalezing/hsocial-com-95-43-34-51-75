import { Group } from "@/types/database/groups.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageSquare, Lock, Globe } from "lucide-react";
import { useGroups } from "@/hooks/use-groups";
import { Link } from "react-router-dom";

interface GroupCardProps {
  group: Group & { user_role?: string };
  showJoinButton?: boolean;
}

export function GroupCard({ group, showJoinButton = true }: GroupCardProps) {
  const { joinGroup, isJoiningGroup } = useGroups();

  const handleJoinGroup = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    joinGroup(group.id);
  };

  const isMember = !!group.user_role;

  return (
    <Link to={`/groups/${group.slug}`}>
      <div className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={group.avatar_url || undefined} alt={group.name} />
            <AvatarFallback className="text-lg">
              {group.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">{group.name}</h3>
              {group.is_private ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Globe className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            
            {group.category && (
              <Badge variant="secondary" className="text-xs mb-2">
                {group.category}
              </Badge>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {group.description || "Sin descripción"}
        </p>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{group.member_count || 0} miembros</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{group.post_count || 0} posts</span>
            </div>
          </div>
        </div>

        {showJoinButton && !isMember && (
          <Button 
            onClick={handleJoinGroup}
            disabled={isJoiningGroup}
            className="w-full"
            size="sm"
          >
            {isJoiningGroup ? "Uniéndose..." : "Unirse"}
          </Button>
        )}

        {isMember && (
          <Badge variant="default" className="w-full justify-center">
            {group.user_role === 'admin' ? 'Administrador' : 
             group.user_role === 'moderator' ? 'Moderador' : 'Miembro'}
          </Badge>
        )}
      </div>
    </Link>
  );
}