
import { useState } from "react";
import { FeedSkeleton } from "./FeedSkeleton";
import { EmptyFeed } from "./EmptyFeed";
import { Post } from "@/types/post";
import { FeedContent } from "./FeedContent";
import { usePersonalizedFeed } from "@/hooks/feed/use-personalized-feed";
import { useRealtimeFeedSimple } from "@/hooks/feed/hooks/use-realtime-feed-simple";
import { PersonalizedFeedToggle, FeedModeExplanation } from "./PersonalizedFeedToggle";
import { FeedFilters, FeedFiltersState } from "./FeedFilters";

interface FeedProps {
  userId?: string;
}

export function Feed({ userId }: FeedProps) {
  const [filters, setFilters] = useState<FeedFiltersState>({
    postTypes: [],
    mediaTypes: [],
    sortBy: "recent"
  });

  const {
    posts,
    isLoading,
    isPersonalized,
    setIsPersonalized,
    trackPostView,
    trackPostInteraction,
    rawPostsCount,
    personalizedPostsCount
  } = usePersonalizedFeed(userId);

  // Set up real-time subscriptions for feed, reactions and comments
  useRealtimeFeedSimple(userId);

  // Filter posts based on active filters
  const filteredPosts = posts.filter(post => {
    // Filter by post type
    if (filters.postTypes.length > 0) {
      const postType = post.post_type || 'regular';
      if (!filters.postTypes.includes(postType)) return false;
    }

    // Filter by media type
    if (filters.mediaTypes.length > 0) {
      const hasMedia = post.media_url;
      const isVideo = post.media_type?.includes('video');
      const isImage = post.media_type?.includes('image') || (hasMedia && !isVideo);
      
      const matchesMediaFilter = filters.mediaTypes.some(type => {
        if (type === 'text') return !hasMedia;
        if (type === 'image') return isImage;
        if (type === 'video') return isVideo;
        return false;
      });
      
      if (!matchesMediaFilter) return false;
    }

    return true;
  });

  // Sort posts based on sort option
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'popular':
        const aLikes = a.likes?.length || 0;
        const bLikes = b.likes?.length || 0;
        return bLikes - aLikes;
      case 'trending':
        // Simple trending algorithm based on recent engagement
        const aScore = (a.likes?.length || 0) + (a.comments?.length || 0) * 2;
        const bScore = (b.likes?.length || 0) + (b.comments?.length || 0) * 2;
        return bScore - aScore;
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (posts.length === 0) {
    return <EmptyFeed />;
  }

  if (filteredPosts.length === 0 && (filters.postTypes.length > 0 || filters.mediaTypes.length > 0)) {
    return (
      <div className="space-y-4">
        <FeedFilters filters={filters} onFiltersChange={setFilters} />
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay publicaciones que coincidan con los filtros seleccionados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0 feed-container mx-auto w-full">
      {/* Feed Mode Toggle */}
      <PersonalizedFeedToggle 
        isPersonalized={isPersonalized}
        onToggle={setIsPersonalized}
        stats={{ rawPostsCount, personalizedPostsCount }}
      />
      
      {/* Explanation */}
      <FeedModeExplanation isPersonalized={isPersonalized} />

      {/* Feed Filters */}
      <FeedFilters filters={filters} onFiltersChange={setFilters} />

      {/* Feed Content */}
      <FeedContent 
        posts={sortedPosts as Post[]}
        trackPostView={trackPostView}
        trackPostInteraction={trackPostInteraction}
      />
    </div>
  );
}
