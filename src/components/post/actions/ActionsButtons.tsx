
import React from "react";
import { Button } from "@/components/ui/button";
import { ShareOptions } from "./ShareOptions";
import { MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { Post } from "@/types/post";
import { ReactionType } from "@/types/database/social.types";
import { useIsMobile } from "@/hooks/use-mobile";
import { HoverReactionButton } from "../reactions/HoverReactionButton";

interface ActionsButtonsProps {
  postId: string;
  userReaction: ReactionType | null;
  onComment: () => void;
  onShare?: () => void;
  compact?: boolean;
  handleReaction?: (type: ReactionType) => void;
  post?: Post;
  showJoinButton?: boolean;
  onJoinClick?: () => void;
  onReaction?: (id: string, type: ReactionType) => void;
  commentsExpanded?: boolean;
}

export function ActionsButtons({
  userReaction,
  handleReaction,
  postId,
  onComment,
  onShare,
  compact = false,
  post,
  onReaction,
  commentsExpanded
}: ActionsButtonsProps) {
  const isMobile = useIsMobile();
  
  // Handler for reaction clicks
  const handleReactionClick = (type: ReactionType) => {
    if (onReaction) {
      onReaction(postId, type);
    } else if (handleReaction) {
      handleReaction(type);
    }
  };

  // Calculate comments count
  const commentsCount = post?.comments_count || 0;

  // Mobile layout - Facebook style
  if (isMobile) {
    return (
      <div className="flex items-center justify-between border-t border-facebook-gray-200 bg-card">
        <div className="flex items-center w-full">
          {/* Me gusta - Facebook style reactions */}
          <div className="flex-1 flex items-center justify-center">
            <HoverReactionButton 
              postId={postId}
              userReaction={userReaction} 
              onReactionClick={handleReactionClick}
              postType="general"
            />
          </div>
          
          {/* Comentar */}
          <Button
            variant="ghost"
            className="flex-1 flex items-center justify-center gap-2 py-3 text-facebook-gray-600 hover:bg-facebook-gray-100 rounded-none"
            onClick={onComment}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Comentar</span>
          </Button>
          
          {/* Compartir */}
          {post ? (
            <ShareOptions post={post}>
              <Button
                variant="ghost"
                className="flex-1 flex items-center justify-center gap-2 py-3 text-facebook-gray-600 hover:bg-facebook-gray-100 rounded-none"
              >
                <Share2 className="h-5 w-5" />
                <span className="text-sm font-medium">Compartir</span>
              </Button>
            </ShareOptions>
          ) : (
            <Button
              variant="ghost"
              className="flex-1 flex items-center justify-center gap-2 py-3 text-facebook-gray-600 hover:bg-facebook-gray-100 rounded-none"
              onClick={onShare}
            >
              <Share2 className="h-5 w-5" />
              <span className="text-sm font-medium">Compartir</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout - Facebook style
  return (
    <div className="flex items-center justify-between border-t border-facebook-gray-200 bg-card px-6">
      <div className="flex items-center w-full">
        {/* Me gusta - Facebook style reactions */}
        <div className="flex-1 flex items-center justify-center">
          <HoverReactionButton 
            postId={postId}
            userReaction={userReaction} 
            onReactionClick={handleReactionClick}
            postType="general"
          />
        </div>
        
        {/* Comentar */}
        <Button
          variant="ghost"
          className="flex-1 flex items-center justify-center gap-2 py-3 text-facebook-gray-600 hover:bg-facebook-gray-100 rounded-lg mx-1"
          onClick={onComment}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">Comentar</span>
        </Button>
        
        {/* Compartir */}
        {post ? (
          <ShareOptions post={post}>
            <Button
              variant="ghost"
              className="flex-1 flex items-center justify-center gap-2 py-3 text-facebook-gray-600 hover:bg-facebook-gray-100 rounded-lg mx-1"
            >
              <Share2 className="h-5 w-5" />
              <span className="font-medium">Compartir</span>
            </Button>
          </ShareOptions>
        ) : (
          <Button
            variant="ghost"
            className="flex-1 flex items-center justify-center gap-2 py-3 text-facebook-gray-600 hover:bg-facebook-gray-100 rounded-lg mx-1"
            onClick={onShare}
          >
            <Share2 className="h-5 w-5" />
            <span className="font-medium">Compartir</span>
          </Button>
        )}
      </div>
    </div>
  );
}
