
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStory } from "@/hooks/use-story";
import { StoryProgress } from "@/components/stories/StoryProgress";
import { useStoryComments } from "@/hooks/use-story-comments";
import { useStoryDeletion } from "@/hooks/use-story-deletion";
import { useStoryReactions } from "@/hooks/use-story-reactions";
import { ReactionType } from "@/types/database/social.types";

interface UseStoryViewProps {
  storyId: string;
  userId?: string;
  onClose: () => void;
}

export function useStoryView({ storyId, userId, onClose }: UseStoryViewProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showReactions, setShowReactions] = useState(false);

  const { storyData, timeDisplay } = useStory(storyId);
  
  const { 
    comments, 
    showComments, 
    handleSendComment, 
    toggleComments, 
    setShowComments 
  } = useStoryComments();

  const { handleStoryReaction } = useStoryReactions(storyId);

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const {
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDeleteStory,
    canDeleteStory
  } = useStoryDeletion({
    storyId,
    userId: userId || currentUser?.id,
    ownerId: storyData?.user?.id,
    onClose
  });

  // Use StoryProgress with proper parameters
  const { progress } = StoryProgress({
    isPaused, 
    currentImageIndex: currentMediaIndex, 
    totalImages: storyData.mediaItems?.length || 1,
    onComplete: handleClose,
    onImageComplete: () => {
      if (currentMediaIndex < (storyData.mediaItems?.length || 1) - 1) {
        setCurrentMediaIndex(prev => prev + 1);
      } else {
        handleClose();
      }
    },
    duration: 5000 // Adding a default duration of 5 seconds
  });

  function handleClose() {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }

  const toggleReactionsPanel = () => {
    setShowReactions(!showReactions);
    setIsPaused(!isPaused);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleCommentsToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleComments(e);
    setIsPaused(!isPaused);
  };

  const handleContentClick = () => {
    if (!showComments && !showReactions) {
      setIsPaused(!isPaused);
    }
  };
  
  const handleNextMedia = () => {
    if (currentMediaIndex < storyData.mediaItems?.length - 1) {
      setCurrentMediaIndex(prev => prev + 1);
    } else {
      handleClose();
    }
  };
  
  const handlePrevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(prev => prev - 1);
    }
  };
  
  const handleReaction = (type: ReactionType) => {
    handleStoryReaction(type);
    // Optionally close reactions panel after reaction
    setTimeout(() => {
      setShowReactions(false);
      setIsPaused(false);
    }, 1000);
  };

  return {
    storyData,
    timeDisplay,
    progress,
    isPaused,
    isExiting,
    currentMediaIndex,
    showReactions,
    showComments,
    showDeleteConfirm,
    comments,
    currentUser,
    canDeleteStory,
    setShowDeleteConfirm,
    setShowComments,
    setIsPaused,
    handleDeleteStory,
    handleClose,
    toggleReactionsPanel,
    togglePause,
    handleCommentsToggle,
    handleContentClick,
    handleNextMedia,
    handlePrevMedia,
    handleSendComment,
    handleReaction
  };
}
