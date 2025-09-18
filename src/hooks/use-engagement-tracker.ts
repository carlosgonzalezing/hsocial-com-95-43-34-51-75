import { useCallback } from "react";
import { engagementAlgorithm, type EngagementAction } from "@/lib/engagement/algorithm";

export function useEngagementTracker() {
  
  const trackAction = useCallback(async (action: EngagementAction) => {
    try {
      const rewards = await engagementAlgorithm.trackAction(action);
      
      // Dispatch custom event for UI components to listen
      if (rewards.length > 0) {
        window.dispatchEvent(new CustomEvent('engagement-reward', { 
          detail: rewards 
        }));
      }
      
      return rewards;
    } catch (error) {
      console.error('Error tracking engagement action:', error);
      return [];
    }
  }, []);

  // Helper functions for common actions
  const trackLogin = useCallback(() => trackAction({ type: 'login' }), [trackAction]);
  
  const trackPost = useCallback((isFirstToday = false) => 
    trackAction({ 
      type: 'post', 
      metadata: { isFirstToday } 
    }), [trackAction]);
  
  const trackStory = useCallback(() => trackAction({ type: 'story' }), [trackAction]);
  
  const trackInteraction = useCallback((count = 1) => 
    trackAction({ 
      type: 'interaction', 
      value: count 
    }), [trackAction]);
  
  const trackComment = useCallback(() => trackAction({ type: 'comment' }), [trackAction]);
  
  const trackReaction = useCallback(() => trackAction({ type: 'reaction' }), [trackAction]);
  
  const trackHeartGiven = useCallback(() => trackAction({ type: 'heart_given' }), [trackAction]);
  
  const trackProfileView = useCallback(() => trackAction({ type: 'profile_view' }), [trackAction]);

  return {
    trackAction,
    trackLogin,
    trackPost,
    trackStory,
    trackInteraction,
    trackComment,
    trackReaction,
    trackHeartGiven,
    trackProfileView
  };
}