import { supabase } from "@/integrations/supabase/client";

// Streak types
export type StreakType = 'login' | 'story' | 'post' | 'interaction';

// Achievement types
export type AchievementType = 
  | 'first_post' 
  | 'social_butterfly' 
  | 'popular_creator' 
  | 'heart_collector'
  | 'story_master'
  | 'friend_magnet'
  | 'engagement_king'
  | 'daily_user';

export interface UserStreak {
  id: string;
  user_id: string;
  streak_type: StreakType;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: AchievementType;
  achievement_data: any;
  earned_at: string;
}

export interface EngagementMetrics {
  id: string;
  user_id: string;
  profile_views_today: number;
  profile_views_total: number;
  posts_engagement_score: number;
  social_score: number;
}

// Update user streak
export async function updateUserStreak(streakType: StreakType) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { error } = await supabase.rpc('update_user_streak', {
      user_id_param: user.id,
      streak_type_param: streakType
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error updating streak:", error);
    throw error;
  }
}

// Get user streaks
export async function getUserStreaks(userId?: string) {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) {
      console.warn("getUserStreaks called without user ID");
      return [];
    }

    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', targetUserId);

    if (error) {
      // Handle specific error codes gracefully
      if (error.code === 'PGRST503' || error.message?.includes('503')) {
        console.warn("Service temporarily unavailable for streaks");
        return [];
      }
      if (error.code === 'PGRST403' || error.message?.includes('403')) {
        console.warn("Permission denied for streaks - user may not be authenticated");
        return [];
      }
      if (error.code === 'PGRST404') {
        console.warn("Streaks table not found");
        return [];
      }
      // For other errors, don't throw to prevent crashes
      console.error("Error fetching streaks:", error);
      return [];
    }
    return data as UserStreak[];
  } catch (error) {
    console.error("Error fetching streaks:", error);
    return [];
  }
}

// Track profile view
export async function trackProfileView(profileId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Don't track self-views
    if (user?.id === profileId) return;

    const { error } = await supabase.rpc('increment_profile_view', {
      profile_id_param: profileId,
      viewer_id_param: user?.id || null
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error tracking profile view:", error);
  }
}

// Get engagement metrics
export async function getEngagementMetrics(userId?: string) {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) {
      console.warn("getEngagementMetrics called without user ID");
      return null;
    }

    const { data, error } = await supabase
      .from('engagement_metrics')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (error) {
      // Handle specific error codes gracefully
      if (error.code === 'PGRST503' || error.message?.includes('503')) {
        console.warn("Service temporarily unavailable for engagement metrics");
        return null;
      }
      if (error.code === 'PGRST403' || error.message?.includes('403')) {
        console.warn("Permission denied for engagement metrics");
        return null;
      }
      if (error.code === 'PGRST404') {
        console.warn("Engagement metrics table not found");
        return null;
      }
      // For other errors, don't throw to prevent crashes
      console.error("Error fetching engagement metrics:", error);
      return null;
    }
    return data as EngagementMetrics | null;
  } catch (error) {
    console.error("Error fetching engagement metrics:", error);
    return null;
  }
}

// Calculate and update social score
export async function updateSocialScore(userId?: string) {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) throw new Error("No user ID provided");

    const { data, error } = await supabase.rpc('calculate_social_score', {
      user_id_param: targetUserId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating social score:", error);
    return 0;
  }
}

// Award achievement
export async function awardAchievement(achievementType: AchievementType, achievementData: any = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: user.id,
        achievement_type: achievementType,
        achievement_data: achievementData
      })
      .select()
      .single();

    if (error) {
      // Achievement already exists, ignore
      if (error.code === '23505') return null;
      throw error;
    }

    return data as UserAchievement;
  } catch (error) {
    console.error("Error awarding achievement:", error);
    return null;
  }
}

// Get user achievements
export async function getUserAchievements(userId?: string) {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) {
      console.warn("getUserAchievements called without user ID");
      return [];
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', targetUserId)
      .order('earned_at', { ascending: false });

    if (error) {
      // Don't throw on 503 errors to prevent infinite retries
      if (error.code === 'PGRST503') {
        console.warn("Service temporarily unavailable for achievements");
        return [];
      }
      throw error;
    }
    return data as UserAchievement[];
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return [];
  }
}

// Check for new achievements based on user activity
export async function checkAndAwardAchievements() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get current achievements
    const existingAchievements = await getUserAchievements();
    const achievementTypes = existingAchievements.map(a => a.achievement_type);

    // Check for first post
    if (!achievementTypes.includes('first_post')) {
      const { data: posts } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (posts && posts.length > 0) {
        await awardAchievement('first_post');
      }
    }

    // Check for social butterfly (10+ friends)
    if (!achievementTypes.includes('social_butterfly')) {
      const { count } = await supabase
        .from('friends')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (count && count >= 10) {
        await awardAchievement('social_butterfly', { friends_count: count });
      }
    }

    // Check for heart collector (50+ hearts) - uses combined hearts (profile + engagement)
    if (!achievementTypes.includes('heart_collector')) {
      // Count hearts received from other users on profile
      const { count: profileHeartsCount } = await supabase
        .from('profile_hearts')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', user.id);

      // Sum hearts earned via engagement
      const { data: engagementHeartsData } = await supabase
        .from('engagement_hearts')
        .select('hearts_received')
        .eq('user_id', user.id);

      const engagementSum = (engagementHeartsData || []).reduce((sum, r) => sum + (r.hearts_received || 0), 0);
      const totalHearts = (profileHeartsCount || 0) + engagementSum;

      if (totalHearts >= 50) {
        await awardAchievement('heart_collector', { hearts_count: totalHearts });
      }
    }

    // Check for daily user (7 day login streak)
    if (!achievementTypes.includes('daily_user')) {
      const streaks = await getUserStreaks();
      const loginStreak = streaks.find(s => s.streak_type === 'login');
      
      if (loginStreak && loginStreak.current_streak >= 7) {
        await awardAchievement('daily_user', { streak_days: loginStreak.current_streak });
      }
    }

  } catch (error) {
    console.error("Error checking achievements:", error);
  }
}

// Get profile view statistics
export async function getProfileViewStats(userId?: string) {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) throw new Error("No user ID provided");

    const { data, error } = await supabase
      .from('profile_views')
      .select('viewed_at, viewer_id')
      .eq('profile_id', targetUserId)
      .order('viewed_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching profile view stats:", error);
    return [];
  }
}