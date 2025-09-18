
import { useCallback } from "react";
import { CommentHeader } from "./CommentHeader";
import { CommentContent } from "./CommentContent";
import { CommentFooter } from "./CommentFooter";
import { ReportCommentDialog } from "./ReportCommentDialog";
import { CommentActions } from "./CommentActions";
import type { Comment } from "@/types/post";
import type { ReactionType } from "@/types/database/social.types";

interface SingleCommentProps {
  comment: Comment;
  onReaction: (commentId: string, type: ReactionType) => void;
  onReply: (id: string, username: string) => void;
  onDeleteComment: (commentId: string) => void;
  isReply?: boolean;
}

export function SingleComment({
  comment,
  onReaction,
  onReply,
  onDeleteComment,
  isReply = false
}: SingleCommentProps) {
  const handleReply = useCallback(() => {
    const username = comment.profiles?.username || "usuario";
    onReply(comment.id, username);
  }, [comment, onReply]);

  const handleDelete = useCallback(() => {
    onDeleteComment(comment.id);
  }, [comment.id, onDeleteComment]);

  const handleEdit = useCallback(() => {
    // This is a placeholder for future edit functionality
    console.log("Edit comment:", comment.id);
  }, [comment.id]);

  // Create a wrapper function that specifically passes "like" as the reaction type
  const handleCommentReaction = useCallback((commentId: string) => {
    onReaction(commentId, "like");
  }, [onReaction]);

  return (
    <div className={`flex gap-2 ${isReply ? "ml-8" : ""}`}>
      {/* Avatar column */}
      <div className="flex-shrink-0">
        <CommentHeader
          userId={comment.user_id}
          profileData={comment.profiles}
          timestamp={comment.created_at}
          isReply={isReply}
        />
      </div>
      
      {/* Comment content column */}
      <div className="flex-grow space-y-1">
        <CommentContent 
          content={comment.content} 
          media={comment.media_url} 
          mediaType={comment.media_type} 
        />
        
        <div className="flex items-center gap-2 mt-1">
          <CommentFooter
            commentId={comment.id}
            userReaction={comment.user_reaction}
            reactionsCount={comment.likes_count || 0}
            onReaction={onReaction}
            onReply={handleReply}
          />
          
          <div className="flex-grow"></div>
          
          <ReportCommentDialog comment={comment} />
          
          <CommentActions 
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <SingleComment
                key={reply.id}
                comment={reply}
                onReaction={onReaction}
                onReply={onReply}
                onDeleteComment={onDeleteComment}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
