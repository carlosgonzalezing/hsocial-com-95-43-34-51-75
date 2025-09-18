
import { useState } from "react";
import { FilePreview } from "../FilePreview";
import { ImageModal } from "./ImageModal";
import { VideoModal } from "./VideoModal";
import { PostPoll } from "./PostPoll";
import { Post } from "@/types/post";
import { PostIdea } from "./PostIdea";
import { MarketplaceDisplay } from "./MarketplaceDisplay";
import { PostImage } from "@/components/ui/optimized-image";
import { backgroundPresets } from "./TextBackgroundPalette";
import { MentionsText } from "./MentionsText";

interface PostContentProps {
  post: Post;
  postId: string;
}

export function PostContent({ post, postId }: PostContentProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  // Check if the post has media
  const hasMedia = !!post.media_url;
  
  // Check if the post has a poll
  const hasPoll = post.poll && post.poll.options?.length > 0;
  
  // Check if the post has idea
  const hasIdea = !!post.idea;

  // Check if the post has marketplace
  const hasMarketplace = !!post.marketplace;

  console.log('PostContent rendering:', { 
    postId: post.id, 
    hasMedia, 
    mediaUrl: post.media_url, 
    mediaType: post.media_type,
    hasMarketplace,
    hasIdea,
    hasPoll
  });

  // Get background preset for styled content
  const backgroundPreset = post.content_style?.backgroundKey 
    ? backgroundPresets.find(p => p.key === post.content_style?.backgroundKey)
    : null;

  // Check if this is a text-only post with background
  const isStyledTextPost = post.content_style?.isTextOnly && 
                          post.content_style?.backgroundKey !== 'none' && 
                          backgroundPreset && 
                          !hasMedia;

  return (
    <div className="px-0 md:px-6 pb-4 pt-0">
      {post.content && (
        <div className={isStyledTextPost ? "relative rounded-lg overflow-hidden mb-4" : ""}>
          {/* Background layer for styled text posts */}
          {isStyledTextPost && (
            <div className={`absolute inset-0 ${backgroundPreset.gradient}`} />
          )}
          
          <MentionsText 
            content={post.content}
            className={
              isStyledTextPost 
                ? "relative z-10 text-xl font-semibold text-white text-center py-16 px-4 md:px-6 whitespace-pre-wrap break-words"
                : "text-sm whitespace-pre-wrap break-words mb-4 post-content px-4 md:px-0"
            }
          />
        </div>
      )}
      
      {hasMedia && !hasMarketplace && (
        <div className="mt-4 mb-6 w-full flex justify-center">
          {post.media_type?.startsWith('image') || post.media_type === 'image' ? (
            <PostImage
              src={post.media_url || ''}
              alt="Contenido multimedia del post"
              className="max-w-full max-h-[400px] object-contain rounded-lg cursor-zoom-in shadow-md"
              onClick={() => setIsImageModalOpen(true)}
            />
          ) : post.media_type?.startsWith('video') || post.media_type === 'video' ? (
            <video
              src={post.media_url || ''}
              className="max-w-full max-h-[400px] object-contain rounded-lg cursor-pointer shadow-md"
              onClick={() => setIsVideoModalOpen(true)}
              onError={(e) => {
                console.error('Error cargando video:', e);
                console.log('URL fallida:', post.media_url);
                // Show fallback content
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                      <p class="text-muted-foreground text-sm">No se pudo cargar el video</p>
                    </div>
                  `;
                }
              }}
              onLoadedData={() => {
                console.log('Video cargado exitosamente:', post.media_url);
              }}
              controls
              preload="metadata"
              crossOrigin="anonymous"
            />
          ) : (
            <FilePreview 
              url={post.media_url || ''} 
              type={post.media_type ?? 'file'}
            />
          )}
        </div>
      )}
      
      {hasPoll && (
        <div className="mt-4">
          <PostPoll poll={post.poll} postId={postId} />
        </div>
      )}
      
      {hasIdea && (
        <div className="mt-4">
          <PostIdea idea={post.idea} postId={postId} />
        </div>
      )}

      {hasMarketplace && (
        <div className="mt-4">
          <MarketplaceDisplay 
            marketplace={post.marketplace} 
            postId={postId}
            sellerUsername={post.profiles?.username}
            isOwnPost={false} // This should be determined based on current user
          />
        </div>
      )}
      
      {/* Image Modal */}
      {post.media_type?.startsWith('image') && (
        <ImageModal 
          isOpen={isImageModalOpen} 
          onClose={() => setIsImageModalOpen(false)}
          imageUrl={post.media_url || ''}
          altText="Post image"
        />
      )}
      
      {/* Video Modal */}
      {post.media_type?.startsWith('video') && (
        <VideoModal 
          isOpen={isVideoModalOpen} 
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={post.media_url || ''}
          altText="Post video"
        />
      )}
    </div>
  );
}
