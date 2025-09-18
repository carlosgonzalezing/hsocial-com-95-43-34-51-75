
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { ReactionType } from "@/types/database/social.types";
import { usePostReactions } from "@/hooks/posts/use-post-reactions";
import { useReactionSounds } from "@/hooks/use-reaction-sounds";

interface LongPressReactionButtonProps {
  postId: string;
  userReaction: ReactionType | null;
  onReactionClick: (type: ReactionType) => void;
}

export function LongPressReactionButton({ 
  postId, 
  userReaction, 
  onReactionClick 
}: LongPressReactionButtonProps) {
  const { isReacting } = usePostReactions(postId);
  const { playReactionSound } = useReactionSounds();
  const [animatingReaction, setAnimatingReaction] = useState<ReactionType | null>(null);
  
  // Function to handle reaction click
  const handleReactionClick = (type: ReactionType = "like") => {
    if (!isReacting) {
      console.log(`LongPressReactionButton: Clicking reaction ${type}`);
      
      // Play sound and show animation
      playReactionSound(type);
      setAnimatingReaction(type);
      
      // Clear animation after it completes
      setTimeout(() => setAnimatingReaction(null), 600);
      
      onReactionClick(type);
    } else {
      console.log("LongPressReactionButton: Reaction in progress, ignoring click");
    }
  };
  
  // Determine if user has reacted
  const hasReacted = !!userReaction;
  
  // Check if this is a project/idea post to show different default reaction
  const isProjectPost = postId && (postId.includes('idea') || postId.includes('project'));
  const defaultReaction: ReactionType = isProjectPost ? "join" : "like";
  const defaultLabel = isProjectPost ? "Me uno" : "Todo bien";
  
  return (
    <Button 
      variant="ghost"
      size="sm"
      className={`flex items-center px-2 py-1 ${hasReacted ? 'text-red-500' : ''}`}
      onClick={() => handleReactionClick(defaultReaction)}
      disabled={isReacting}
    >
      <Heart 
        className={`h-6 w-6 mr-1.5 transition-transform duration-200 ${hasReacted ? "fill-red-500 text-red-500 scale-110 reaction-love" : ""} ${animatingReaction === defaultReaction ? 'reaction-like' : ''}`}
        strokeWidth={1.5}
      />
      <span>{defaultLabel}</span>
    </Button>
  );
}
