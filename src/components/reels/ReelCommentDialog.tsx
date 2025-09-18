
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Post, Comment } from "@/types/post";
import { Comments } from "@/components/post/Comments";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePostComments } from "@/hooks/posts/use-post-comments";
import { useCommentMutations } from "@/hooks/use-comment-mutations";

interface ReelCommentDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReelCommentDialog({ post, open, onOpenChange }: ReelCommentDialogProps) {
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const { toast } = useToast();
  
  // Get comments and handlers from the hook
  const { 
    comments, 
    handleCommentReaction, 
    handleReply 
  } = usePostComments(post.id, open, setReplyTo, setNewComment);
  
  // Get comment mutations
  const { submitComment, deleteComment } = useCommentMutations(post.id);
  
  // Handle comment submission
  const handleSubmitComment = () => {
    if (!newComment.trim() && !commentImage) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El comentario no puede estar vacío",
      });
      return;
    }
    
    submitComment({ 
      content: newComment, 
      replyToId: replyTo?.id,
      image: commentImage 
    });
    
    setNewComment("");
    setCommentImage(null);
    setReplyTo(null);
  };
  
  // Handle comment deletion
  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);
  };
  
  // Cancel reply
  const handleCancelReply = () => {
    setReplyTo(null);
    setNewComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Comentarios</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto py-4">
          <Comments 
            postId={post.id}
            comments={comments}
            onReaction={handleCommentReaction}
            onReply={handleReply}
            onSubmitComment={handleSubmitComment}
            onDeleteComment={handleDeleteComment}
            newComment={newComment}
            onNewCommentChange={setNewComment}
            replyTo={replyTo}
            onCancelReply={handleCancelReply}
            showComments={true}
            commentImage={commentImage}
            setCommentImage={setCommentImage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
