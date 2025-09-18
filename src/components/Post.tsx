
import { Card } from "@/components/ui/card";
import { Comments } from "@/components/post/Comments";
import { PostActions } from "@/components/post/PostActions";
import { PostContent } from "@/components/post/PostContent";
import { PostHeader } from "@/components/post/PostHeader";
import { type Post as PostType } from "@/types/post";
import { SharedPostContent } from "./post/SharedPostContent";
import { usePost } from "@/hooks/use-post";
import { PostWrapper } from "./post/PostWrapper";
import { useEffect } from "react";
import { IdeaContent } from "./post/IdeaContent";
import { PostOptionsMenu } from "./post/actions/PostOptionsMenu";

interface PostProps {
  post: PostType;
  hideComments?: boolean;
  isHidden?: boolean;
}

export function Post({ post, hideComments = false, isHidden = false }: PostProps) {
  // Verificación de seguridad si el post es inválido
  if (!post || !post.id) {
    console.error("Invalid post object:", post);
    return null;
  }

  const {
    showComments,
    comments,
    newComment,
    commentImage,
    setCommentImage,
    replyTo,
    isCurrentUserAuthor,
    onDeletePost,
    toggleComments,
    handleCommentReaction,
    handleReply,
    handleSubmitComment,
    handleCancelReply,
    handleDeleteComment,
    setNewComment
  } = usePost(post, hideComments);

  // Determinar si esta es una publicación compartida
  const isSharedPost = !!post.shared_post;
  // Determinar si esta es una publicación de idea
  const isIdeaPost = !!post.idea;
  // Determinar si la publicación está fijada
  const isPinned = post.is_pinned;

  return (
    <PostWrapper isHidden={isHidden} isIdeaPost={isIdeaPost} isPinned={isPinned}>
      <PostHeader 
        post={post} 
        onDelete={onDeletePost}
        isAuthor={isCurrentUserAuthor}
        isHidden={isHidden}
        content={post.content || ""}
        isIdeaPost={isIdeaPost}
      />
      
      {isSharedPost ? (
        <SharedPostView post={post} />
      ) : isIdeaPost ? (
        <IdeaPostView post={post} />
      ) : (
        <StandardPostView post={post} />
      )}
      
      <PostActions 
        post={post} 
        onToggleComments={toggleComments}
        onCommentsClick={toggleComments}
        commentsExpanded={showComments}
        isIdeaPost={isIdeaPost}
      />
      
      {!hideComments && showComments && (
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
          showComments={showComments}
          commentImage={commentImage}
          setCommentImage={setCommentImage}
        />
      )}
    </PostWrapper>
  );
}

// Componente de ayuda para la vista de publicación compartida
function SharedPostView({ post }: { post: PostType }) {
  return (
    <div className="px-0 md:px-4 pb-4">
      {post.content && (
        <p className="text-sm whitespace-pre-wrap break-words mb-4 px-4 md:px-0">{post.content}</p>
      )}
      <div className="border border-border rounded-none md:rounded-lg overflow-hidden">
        <div className="flex items-center mb-2 px-4">
          <span className="text-sm text-muted-foreground">
            Publicación original
          </span>
        </div>
        {post.shared_post && (
          <SharedPostContent post={post.shared_post} />
        )}
      </div>
    </div>
  );
}

// Componente para las publicaciones de tipo Idea
function IdeaPostView({ post }: { post: PostType }) {
  if (!post.idea) return null;
  
  return (
    <div className="px-0 md:px-4 pb-2">
      <IdeaContent 
        idea={post.idea} 
        content={post.content || ''}
      />
    </div>
  );
}

// Componente de ayuda para la vista de publicación estándar
function StandardPostView({ post }: { post: PostType }) {
  return (
    <>
      <PostContent 
        post={post} 
        postId={post.id}
      />
      
      {post.shared_post && (
        <div className="px-0 md:px-4 pb-4 mt-2">
          <div className="border border-border rounded-none md:rounded-lg overflow-hidden">
            <SharedPostContent post={post.shared_post} />
          </div>
        </div>
      )}
    </>
  );
}
