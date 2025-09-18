import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getUserStreaks, 
  updateUserStreak, 
  getEngagementMetrics, 
  getUserAchievements, 
  checkAndAwardAchievements,
  trackProfileView,
  updateSocialScore,
  type StreakType,
  type UserStreak,
  type EngagementMetrics,
  type UserAchievement
} from "@/lib/api/engagement";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useEngagement(userId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get current user ID if none provided
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const getCurrentUser = async () => {
      if (!userId) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          setCurrentUserId(user?.id || null);
        } catch (error) {
          console.error('Error getting current user:', error);
          setCurrentUserId(null);
        }
      } else {
        setCurrentUserId(userId);
      }
    };
    
    getCurrentUser();
  }, [userId]);

  const effectiveUserId = userId || currentUserId;

  // Fetch user streaks
  const { data: streaks = [], isLoading: streaksLoading, error: streaksError } = useQuery({
    queryKey: ['user-streaks', effectiveUserId],
    queryFn: () => getUserStreaks(effectiveUserId!),
    enabled: !!effectiveUserId,
    retry: (failureCount, error: any) => {
      // Don't retry on 503 Service Unavailable
      if (error?.code === 'PGRST503' || error?.message?.includes('503')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch engagement metrics
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['engagement-metrics', effectiveUserId],
    queryFn: () => getEngagementMetrics(effectiveUserId!),
    enabled: !!effectiveUserId,
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST503' || error?.message?.includes('503')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch achievements
  const { data: achievements = [], isLoading: achievementsLoading, error: achievementsError } = useQuery({
    queryKey: ['user-achievements', effectiveUserId],
    queryFn: () => getUserAchievements(effectiveUserId!),
    enabled: !!effectiveUserId,
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST503' || error?.message?.includes('503')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Update streak mutation
  const updateStreakMutation = useMutation({
    mutationFn: updateUserStreak,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-streaks'] });
    },
    onError: (error: any) => {
      console.error('Error updating streak:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la racha",
        variant: "destructive"
      });
    }
  });

  // Track profile view mutation
  const trackViewMutation = useMutation({
    mutationFn: trackProfileView,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engagement-metrics'] });
    }
  });

  // Update social score mutation
  const updateScoreMutation = useMutation({
    mutationFn: (userId?: string) => updateSocialScore(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engagement-metrics'] });
    }
  });

  // Check achievements mutation
  const checkAchievementsMutation = useMutation({
    mutationFn: checkAndAwardAchievements,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
    }
  });

  // Helper functions
  const getStreak = useCallback((type: StreakType): UserStreak | null => {
    return streaks.find(s => s.streak_type === type) || null;
  }, [streaks]);

  const updateStreak = useCallback((type: StreakType) => {
    updateStreakMutation.mutate(type);
  }, [updateStreakMutation]);

  const trackView = useCallback((profileId: string) => {
    trackViewMutation.mutate(profileId);
  }, [trackViewMutation]);

  const refreshSocialScore = useCallback(() => {
    if (effectiveUserId) {
      updateScoreMutation.mutate(effectiveUserId);
    }
  }, [updateScoreMutation, effectiveUserId]);

  const checkAchievements = useCallback(() => {
    checkAchievementsMutation.mutate();
  }, [checkAchievementsMutation]);

  // Auto-check for achievements when streaks or metrics update
  useEffect(() => {
    if (effectiveUserId && (streaks.length > 0 || metrics) && !streaksError && !metricsError) {
      checkAchievements();
    }
  }, [streaks.length, metrics, effectiveUserId, checkAchievements, streaksError, metricsError]);

  return {
    // Data
    streaks,
    metrics,
    achievements,
    
    // Loading states
    isLoading: streaksLoading || metricsLoading || achievementsLoading,
    streaksLoading,
    metricsLoading,
    achievementsLoading,
    
    // Error states
    hasErrors: !!(streaksError || metricsError || achievementsError),
    streaksError,
    metricsError,
    achievementsError,
    
    // Helper functions
    getStreak,
    updateStreak,
    trackView,
    refreshSocialScore,
    checkAchievements,
    
    // Computed values
    loginStreak: getStreak('login'),
    postStreak: getStreak('post'),
    storyStreak: getStreak('story'),
    interactionStreak: getStreak('interaction'),
    
    // Social metrics
    profileViewsToday: metrics?.profile_views_today || 0,
    profileViewsTotal: metrics?.profile_views_total || 0,
    socialScore: metrics?.social_score || 0,
    engagementScore: metrics?.posts_engagement_score || 0,
    
    // Achievement counts
    achievementCount: achievements.length,
    recentAchievements: achievements.slice(0, 3),
  };
}

// Hook specifically for tracking user activity and updating streaks
export function useActivityTracker() {
  const queryClient = useQueryClient();
  
  // Update login streak when component mounts (user becomes active)
  useEffect(() => {
    const updateLoginStreak = async () => {
      try {
        await updateUserStreak('login');
        queryClient.invalidateQueries({ queryKey: ['user-streaks'] });
      } catch (error) {
        console.error('Error updating login streak:', error);
      }
    };

    updateLoginStreak();
  }, [queryClient]);

  // Listen for real-time updates to achievements
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const channel = supabase
        .channel('achievements-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_achievements',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, [queryClient]);

  return {
    // Functions for updating specific activity streaks
    updatePostStreak: () => updateUserStreak('post'),
    updateStoryStreak: () => updateUserStreak('story'),
    updateInteractionStreak: () => updateUserStreak('interaction'),
  };
}