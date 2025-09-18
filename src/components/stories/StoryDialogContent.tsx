
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StoryReaction } from './StoryReaction';
import { ReactionType } from '@/types/database/social.types';
import { StoryContent } from './StoryContent';
import { StoryControls } from './StoryControls';
import { StoryActions } from './StoryActions';

interface StoryDialogContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stories: any[];
  currentUserId: string;
  onReaction?: (storyId: string, type: ReactionType) => void;
  
  // Additional props needed by StoryView
  storyId?: string;
  storyData?: any;
  timeDisplay?: string;
  progress?: number;
  currentMediaIndex?: number;
  isPaused?: boolean;
  isExiting?: boolean;
  showReactions?: boolean;
  showComments?: boolean;
  comments?: any[];
  currentUser?: any;
  canDeleteStory?: boolean;
  onClose?: () => void;
  onPauseToggle?: () => void;
  onDeleteRequest?: () => void;
  onContentClick?: () => void;
  onNextImage?: () => void;
  onPrevImage?: () => void;
  onReactionsToggle?: () => void;
  onCommentsToggle?: () => void;
  onCommentsFocus?: () => void;
  onCommentsClose?: () => void;
  onSendComment?: (commentText: string) => void;
}

export function StoryDialogContent({
  open,
  onOpenChange,
  stories,
  currentUserId,
  onReaction,
  
  // Additional props used by StoryView
  storyId,
  storyData,
  timeDisplay,
  progress,
  currentMediaIndex,
  isPaused,
  isExiting,
  showReactions,
  showComments,
  comments,
  currentUser,
  canDeleteStory,
  onClose,
  onPauseToggle,
  onDeleteRequest,
  onContentClick,
  onNextImage,
  onPrevImage,
  onReactionsToggle,
  onCommentsToggle,
  onCommentsFocus,
  onCommentsClose,
  onSendComment
}: StoryDialogContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStory, setCurrentStory] = useState(stories?.[0]);
  const [showReactionsLocal, setShowReactionsLocal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (stories && stories.length > 0) {
      setCurrentIndex(0);
      setCurrentStory(stories[0]);
    }
  }, [stories]);

  useEffect(() => {
    if (open && currentStory) {
      setShowReactionsLocal(true);
    } else {
      setShowReactionsLocal(false);
    }
  }, [open, currentStory]);

  const handleNext = () => {
    if (stories && currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentStory(stories[currentIndex + 1]);
    } else if (onClose) {
      onClose();
    } else {
      onOpenChange(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentStory(stories[currentIndex - 1]);
    } else if (onClose) {
      onClose();
    } else {
      onOpenChange(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      handleNext();
    } else if (event.key === "ArrowLeft") {
      handlePrevious();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, stories]);

  if ((!currentStory && !storyData)) {
    return null;
  }
  
  const handleReact = (type: ReactionType) => {
    // Handle reaction logic
    if (onReaction && currentStory) {
      onReaction(currentStory.id, type);
    } else if (storyId && onReaction) {
      onReaction(storyId, type);
    }
  };

  // If this is being used in StoryView mode, render the adapted version
  if (storyData && storyId) {
    const mediaItems = storyData.mediaItems || [];
    
    return (
      <div className={`relative w-full h-full bg-black flex flex-col ${isExiting ? 'animate-fade-out' : 'animate-fade-in'}`}>
        {/* Progress bar at the top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 z-20">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ width: `${progress || 0}%` }}
          />
        </div>
        
        {/* Story header with user info and close button */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-background overflow-hidden border-2 border-white">
                {storyData.user?.avatarUrl ? (
                  <img 
                    src={storyData.user.avatarUrl} 
                    alt={storyData.user.username}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/20 text-white">
                    {storyData.user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="ml-3 text-white">
                <p className="font-medium">{storyData.user?.username}</p>
                <p className="text-xs opacity-80">{timeDisplay}</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white h-8 w-8"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Story controls - including pause and delete */}
        {onDeleteRequest && onPauseToggle && (
          <StoryControls
            isPaused={isPaused || false}
            canDelete={canDeleteStory || false}
            onPauseToggle={(e) => {
              e.stopPropagation();
              onPauseToggle();
            }}
            onDeleteRequest={onDeleteRequest}
          />
        )}
        
        {/* Story content - main part */}
        <StoryContent
          mediaItems={mediaItems}
          currentIndex={currentMediaIndex || 0}
          onContentClick={onContentClick || (() => {})}
          onNextImage={onNextImage || (() => {})}
          onPrevImage={onPrevImage || (() => {})}
          isPaused={isPaused || false}
          className="flex-1"
        />
        
        {/* Story actions - comment and react buttons */}
        {onReactionsToggle && onCommentsToggle && (
          <StoryActions
            toggleComments={(e) => {
              e.stopPropagation();
              onCommentsToggle();
            }}
            toggleReactions={(e) => {
              e.stopPropagation();
              onReactionsToggle();
            }}
            className="mb-6"
          />
        )}
        
        {/* Reactions panel */}
        {showReactions && (
          <StoryReaction
            storyId={storyId}
            showReactions={true}
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
            onReact={handleReact}
          />
        )}
      </div>
    );
  }

  // Original rendering for standalone dialog
  return (
    <div className="relative w-full max-w-md mx-auto">
      <Button
        variant="ghost"
        className="absolute top-2 right-2 text-white"
        onClick={() => onOpenChange(false)}
      >
        <X className="h-6 w-6" />
      </Button>
      <div className="relative">
        <img
          src={currentStory.media_url}
          alt="Story"
          className="object-contain max-h-[80vh] w-full rounded-md"
        />
        <StoryReaction
          storyId={currentStory.id}
          showReactions={showReactionsLocal}
          className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
          onReact={handleReact}
        />
      </div>
      <div className="absolute bottom-2 left-2 w-full flex items-center justify-between">
        <Button variant="ghost" className="text-white" onClick={handlePrevious}>
          Anterior
        </Button>
        <Button variant="ghost" className="text-white" onClick={handleNext}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
