
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useStoryView } from "@/hooks/use-story-view";
import { StoryDialogContent } from "./StoryDialogContent";
import { StoryDeleteConfirmation } from "./StoryDeleteConfirmation";
import { useIsMobile } from "@/hooks/use-mobile";

interface StoryViewProps {
  storyId: string;
  onClose: () => void;
  userId?: string;
}

export function StoryView({ storyId, onClose, userId }: StoryViewProps) {
  const isMobile = useIsMobile();
  const {
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
  } = useStoryView({ storyId, userId, onClose });
  
  // Create a wrapper function that doesn't need the event parameter
  const handleToggleComments = () => {
    // Create a synthetic event to pass to the original handler
    const syntheticEvent = {
      stopPropagation: () => {}
    } as React.MouseEvent;
    handleCommentsToggle(syntheticEvent);
  };
  
  // En móvil, mostrar en pantalla completa sin dialog
  if (isMobile) {
    return (
      <>
        <div className="fixed inset-0 z-50 bg-black">
          <StoryDialogContent
            open={true}
            onOpenChange={() => {}}
            stories={[]}
            currentUserId={currentUser?.id || ""}
            storyId={storyId}
            storyData={storyData}
            timeDisplay={timeDisplay}
            progress={progress}
            currentMediaIndex={currentMediaIndex}
            isPaused={isPaused}
            isExiting={isExiting}
            showReactions={showReactions}
            showComments={showComments}
            comments={comments}
            currentUser={currentUser}
            canDeleteStory={canDeleteStory}
            onClose={handleClose}
            onPauseToggle={togglePause}
            onDeleteRequest={() => setShowDeleteConfirm(true)}
            onContentClick={handleContentClick}
            onNextImage={handleNextMedia}
            onPrevImage={handlePrevMedia}
            onReactionsToggle={toggleReactionsPanel}
            onCommentsToggle={handleToggleComments} // Use the wrapper function here
            onCommentsFocus={() => {
              setIsPaused(true);
              setShowComments(true);
            }}
            onCommentsClose={() => {
              setShowComments(false);
              setIsPaused(false);
            }}
            onSendComment={handleSendComment}
            onReaction={handleReaction}
          />
        </div>

        <StoryDeleteConfirmation 
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          onConfirm={handleDeleteStory}
        />
      </>
    );
  }

  // En desktop, usar dialog normal
  return (
    <>
      <Dialog open={true} onOpenChange={() => handleClose()}>
        <DialogTitle className="sr-only">Ver historia</DialogTitle>
        <DialogContent className="p-0 max-w-md">
          <StoryDialogContent
            open={true}
            onOpenChange={() => {}}
            stories={[]}
            currentUserId={currentUser?.id || ""}
            storyId={storyId}
            storyData={storyData}
            timeDisplay={timeDisplay}
            progress={progress}
            currentMediaIndex={currentMediaIndex}
            isPaused={isPaused}
            isExiting={isExiting}
            showReactions={showReactions}
            showComments={showComments}
            comments={comments}
            currentUser={currentUser}
            canDeleteStory={canDeleteStory}
            onClose={handleClose}
            onPauseToggle={togglePause}
            onDeleteRequest={() => setShowDeleteConfirm(true)}
            onContentClick={handleContentClick}
            onNextImage={handleNextMedia}
            onPrevImage={handlePrevMedia}
            onReactionsToggle={toggleReactionsPanel}
            onCommentsToggle={handleToggleComments}
            onCommentsFocus={() => {
              setIsPaused(true);
              setShowComments(true);
            }}
            onCommentsClose={() => {
              setShowComments(false);
              setIsPaused(false);
            }}
            onSendComment={handleSendComment}
            onReaction={handleReaction}
          />
        </DialogContent>
      </Dialog>

      <StoryDeleteConfirmation 
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteStory}
      />
    </>
  );
}
