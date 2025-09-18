import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getPostReactionUsers, type ReactionUser } from "@/lib/api/posts/queries/reaction-users";
import { reactionIcons, type ReactionType } from "./ReactionIcons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ReactionsModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  totalReactions: number;
}

export function ReactionsModal({ postId, isOpen, onClose, totalReactions }: ReactionsModalProps) {
  const [activeTab, setActiveTab] = useState("all");

  const { data: reactionUsers = [], isLoading } = useQuery({
    queryKey: ["post-reaction-users", postId],
    queryFn: () => getPostReactionUsers(postId),
    enabled: isOpen
  });

  // Group reactions by type
  const reactionGroups = reactionUsers.reduce((acc, user) => {
    if (!acc[user.reaction_type]) {
      acc[user.reaction_type] = [];
    }
    acc[user.reaction_type].push(user);
    return acc;
  }, {} as Record<string, ReactionUser[]>);

  const filteredUsers = activeTab === "all" 
    ? reactionUsers 
    : reactionGroups[activeTab] || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {totalReactions} {totalReactions === 1 ? "reacción" : "reacciones"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 gap-1 mb-4">
            <TabsTrigger value="all" className="text-xs">
              Todos
            </TabsTrigger>
            {Object.entries(reactionGroups).slice(0, 3).map(([type, users]) => {
              const reaction = reactionIcons[type as ReactionType];
              if (!reaction) return null;

              return (
                <TabsTrigger key={type} value={type} className="text-xs flex items-center gap-1">
                  {reaction.emoji ? (
                    <span className="text-sm">{reaction.emoji}</span>
                  ) : (
                    <reaction.icon className={`h-3 w-3 ${reaction.color}`} />
                  )}
                  <span>{users.length}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="overflow-y-auto max-h-[400px]">
            <TabsContent value="all" className="mt-0">
              <ReactionUsersList users={reactionUsers} isLoading={isLoading} />
            </TabsContent>
            
            {Object.entries(reactionGroups).map(([type, users]) => (
              <TabsContent key={type} value={type} className="mt-0">
                <ReactionUsersList users={users} isLoading={isLoading} />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface ReactionUsersListProps {
  users: ReactionUser[];
  isLoading: boolean;
}

function ReactionUsersList({ users, isLoading }: ReactionUsersListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 bg-muted rounded animate-pulse w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No hay reacciones aún
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => {
        const reaction = reactionIcons[user.reaction_type as ReactionType];
        
        return (
          <div key={`${user.user_id}-${user.created_at}`} className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profile?.avatar_url || ""} />
                <AvatarFallback>
                  {user.profile?.username?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              
              {reaction && (
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full border border-border p-0.5">
                  {reaction.emoji ? (
                    <span className="text-xs leading-none">{reaction.emoji}</span>
                  ) : (
                    <reaction.icon className={`h-3 w-3 ${reaction.color}`} />
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {user.profile?.username || "Usuario"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(user.created_at), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}