
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { useStoryViewer } from "@/hooks/use-story-viewer";
import { StoryView } from "./StoryView";
import { FullScreenStoriesViewer } from "./FullScreenStoriesViewer";
import { StoryCreator } from "./StoryCreator";
import { Card } from "@/components/ui/card";
import { useUserProfile } from "@/components/user-menu/hooks/useUserProfile";

interface StoryBannerProps {
  currentUserId: string;
}

export function StoryBanner({ currentUserId }: StoryBannerProps) {
  const {
    showStoryCreator,
    setShowStoryCreator,
    viewingStory,
    setViewingStory,
    stories,
    isLoading,
    refetchStories
  } = useStoryViewer(currentUserId);

  const { username, avatarUrl } = useUserProfile();

  // Handle story creation completion
  const handleStoryCreatorClose = () => {
    setShowStoryCreator(false);
    refetchStories();
  };

  // Find the current user's story
  const userStory = stories.find(story => story.userId === currentUserId);

  return (
    <Card className="p-2 mb-1 bg-card border-border rounded-md">
      {showStoryCreator && (
        <StoryCreator 
          onClose={handleStoryCreatorClose} 
          currentUserId={currentUserId}
        />
      )}
      
      {viewingStory && (
        <FullScreenStoriesViewer 
          initialStoryId={viewingStory}
          currentUserId={currentUserId}
          onClose={() => setViewingStory(null)}
        />
      )}

      <div className="flex w-full overflow-x-auto scrollbar-hide gap-4 pb-2">
        {/* Create story button */}
        <div 
          className="flex flex-col items-center gap-1 cursor-pointer min-w-[76px]"
          onClick={() => setShowStoryCreator(true)}
        >
          <div className="relative w-32 h-48 bg-muted rounded-lg overflow-hidden">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                className="w-full h-full object-cover"
                alt={username || "Tu perfil"}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-2xl">
                    {username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg">
              <div className="flex items-center justify-center">
                <div className="bg-primary rounded-full p-2">
                  <Plus className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-white text-center mt-1">
                Crear historia
              </p>
            </div>
          </div>
        </div>

        {/* Stories list */}
        {!isLoading && stories.length > 0 && (
          <>
            {stories.map((story) => {
              const hasUnseenStories = story.hasUnseenStories;
              const firstStoryId = story.storyIds && story.storyIds.length > 0 
                ? story.storyIds[0] 
                : story.id;
                
              return (
                <div 
                  key={story.id}
                  className="flex flex-col items-center gap-1 cursor-pointer min-w-[76px]"
                  onClick={() => setViewingStory(firstStoryId)}
                >
                  <div className={`relative w-32 h-48 rounded-lg overflow-hidden ${
                    hasUnseenStories ? 'ring-2 ring-primary' : ''
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-indigo-500/30"></div>
                    {story.avatarUrl && (
                      <img 
                        src={story.avatarUrl} 
                        className="w-full h-full object-cover"
                        alt={story.username}
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7 border-2 border-white">
                          <AvatarImage src={story.avatarUrl || undefined} />
                          <AvatarFallback>{story.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-white truncate">
                          {story.username}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        
        {/* Loading placeholders */}
        {isLoading && (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[76px]">
                <div className="w-32 h-48 rounded-lg bg-muted animate-pulse" />
              </div>
            ))}
          </>
        )}
      </div>
    </Card>
  );
}
