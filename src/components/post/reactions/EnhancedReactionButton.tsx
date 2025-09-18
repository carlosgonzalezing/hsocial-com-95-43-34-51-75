import React from 'react';
import { Button } from "@/components/ui/button";
import { reactionIcons, ReactionType } from "./ReactionIcons";
import { useProjectJoin } from "@/hooks/use-project-join";

interface EnhancedReactionButtonProps {
  postId: string;
  userReaction: ReactionType | null;
  onReactionClick: (type: ReactionType) => void;
  postType?: string;
}

export function EnhancedReactionButton({ 
  postId, 
  userReaction, 
  onReactionClick,
  postType 
}: EnhancedReactionButtonProps) {
  const { isJoining, handleProjectJoin } = useProjectJoin(postId);
  
  // Determine the appropriate primary reaction based on post type
  const isProjectPost = postType === 'idea' || postType === 'project' || postType === 'opportunity';
  const primaryReactionType: ReactionType = isProjectPost ? "join" : "like";
  const primaryReaction = reactionIcons[primaryReactionType];
  
  const handleClick = async () => {
    if (primaryReactionType === "join" && isProjectPost) {
      // Handle special project join functionality
      const joined = await handleProjectJoin();
      
      // Also add the reaction
      onReactionClick("join");
    } else {
      // Handle normal reaction
      onReactionClick(primaryReactionType);
    }
  };
  
  // Check if user has this specific reaction
  const hasThisReaction = userReaction === primaryReactionType;
  const { color, emoji } = primaryReaction;
  
  return (
    <Button 
      variant="ghost"
      size="sm"
      className={`flex items-center px-2 py-1 transition-colors ${
        hasThisReaction ? `${color} bg-muted/50` : 'hover:bg-muted/50'
      }`}
      onClick={handleClick}
      disabled={isJoining}
    >
      <div className="flex items-center justify-center h-5 w-5 mr-1.5">
        {emoji ? (
          <span className={`text-lg ${hasThisReaction ? 'scale-110' : ''} transition-transform`}>
            {emoji}
          </span>
        ) : (
          <primaryReaction.icon 
            className={`h-5 w-5 ${hasThisReaction ? `${color} fill-current` : ''}`}
          />
        )}
      </div>
      <span className="text-sm font-medium">
        {primaryReaction.label}
      </span>
    </Button>
  );
}