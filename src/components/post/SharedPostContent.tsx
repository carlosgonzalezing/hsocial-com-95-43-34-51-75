
import { Post } from "@/types/post";
import { FilePreview } from "@/components/FilePreview";
import { useState } from "react";
import { ImageModal } from "@/components/post/ImageModal";
import { IdeaDisplay } from "./idea/IdeaDisplay";
import { PostImage } from "@/components/ui/optimized-image";
import { MentionsText } from "./MentionsText";

interface SharedPostContentProps {
  post: Post;
}

export function SharedPostContent({ post }: SharedPostContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Si el post compartido es una idea y el objeto idea existe, renderizarlo usando el componente IdeaDisplay
  if (post && post.idea) {
    return (
      <div className="space-y-2">
        <IdeaDisplay 
          post={post}
          showHeader={true}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <MentionsText content={post.content} className="text-sm whitespace-pre-wrap break-words" />
      
      {post.media_url && post.media_type && post.media_type.startsWith('image') && (
        <>
          <div className="relative flex justify-center">
            <PostImage
              src={post.media_url}
              alt="Media"
              className="max-w-full max-h-[300px] object-contain rounded-lg cursor-zoom-in"
              onClick={() => setIsModalOpen(true)}
            />
          </div>
          
          <ImageModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            imageUrl={post.media_url}
            altText="Shared post image"
          />
        </>
      )}
      
      {post.media_url && (!post.media_type || !post.media_type.startsWith('image')) && (
        <FilePreview 
          url={post.media_url} 
          type={post.media_type ?? 'file'}
        />
      )}
    </div>
  );
}
