
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useStoryViewer(currentUserId: string) {
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [viewingStory, setViewingStory] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["stories", currentUserId, Date.now()],
    queryFn: async () => {
      console.log('🔄 Fetching stories for user:', currentUserId);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      // Fetch active stories (not expired)
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select(`id, user_id, created_at`)
        .gte('expires_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching stories:", error);
        return [];
      }
      
      // Get unique user IDs from the stories
      const userIds = [...new Set(storiesData.map(story => story.user_id))];
      
      // Fetch user profiles for these IDs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return [];
      }
      
      // Create a map for quick profile lookup
      const profilesMap = new Map(profiles.map(profile => [profile.id, profile]));
      
      // Get the stories the current user has viewed
      const { data: views, error: viewsError } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('viewer_id', currentUserId);
        
      if (viewsError) {
        console.error("Error fetching story views:", viewsError);
        return [];
      }
      
      // Create a set of viewed story IDs for quick lookup
      const viewedStoryIds = new Set(views.map(view => view.story_id));
      
      // Group stories by user
      const userStories: Record<string, any> = {};
      
      storiesData.forEach(story => {
        const userId = story.user_id;
        const isViewed = viewedStoryIds.has(story.id);
        const profile = profilesMap.get(userId);
        
        if (!userStories[userId]) {
          userStories[userId] = {
            id: userId, // This is the user ID
            userId,
            username: profile?.username || 'Usuario',
            avatarUrl: profile?.avatar_url,
            storyIds: [story.id],
            hasUnseenStories: !isViewed
          };
        } else {
          userStories[userId].storyIds.push(story.id);
          if (!isViewed) {
            userStories[userId].hasUnseenStories = true;
          }
        }
      });
      
      const result = Object.values(userStories);
      console.log('📊 Stories grouped by user:', result);
      return result;
    },
    staleTime: 0, // Always consider data stale
    gcTime: 1000 * 30, // Keep in cache for 30 seconds only
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true
  });

  return {
    showStoryCreator,
    setShowStoryCreator,
    viewingStory,
    setViewingStory,
    stories,
    isLoading,
    refetchStories: () => {
      console.log('🔄 Manually refreshing stories');
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["user-stories"] });
      queryClient.removeQueries({ queryKey: ["story"] }); // Remove all story cache
    }
  };
}
