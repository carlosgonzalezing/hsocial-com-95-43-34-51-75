import { supabase } from "@/integrations/supabase/client";
import { updateUserStreak, awardAchievement, updateSocialScore } from "@/lib/api/engagement";

export interface EngagementAction {
  type: 'login' | 'post' | 'story' | 'interaction' | 'comment' | 'reaction' | 'heart_given' | 'profile_view';
  value?: number;
  metadata?: Record<string, any>;
}

export interface EngagementReward {
  type: 'hearts' | 'achievement' | 'social_score_boost';
  amount: number;
  reason: string;
}

// Engagement scoring system
const ENGAGEMENT_SCORES = {
  login: 10,
  post: 25,
  story: 20,
  interaction: 5,
  comment: 15,
  reaction: 8,
  heart_given: 12,
  profile_view: 3
};

// Daily engagement thresholds for rewards
const DAILY_THRESHOLDS = {
  active_user: 50,     // Basic daily activity
  super_active: 150,   // High engagement
  power_user: 300      // Exceptional engagement
};

export class EngagementAlgorithm {
  private static instance: EngagementAlgorithm;
  private dailyScore = 0;
  private lastLoginDate: string | null = null;

  static getInstance(): EngagementAlgorithm {
    if (!EngagementAlgorithm.instance) {
      EngagementAlgorithm.instance = new EngagementAlgorithm();
    }
    return EngagementAlgorithm.instance;
  }

  // Track user action and calculate rewards
  async trackAction(action: EngagementAction): Promise<EngagementReward[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const rewards: EngagementReward[] = [];
      const today = new Date().toISOString().split('T')[0];

      // Update daily score
      await this.updateDailyScore(action);

      // Handle streak updates
      if (['login', 'post', 'story', 'interaction'].includes(action.type)) {
        await updateUserStreak(action.type as any);
        
        // Reward for maintaining streaks
        const streak = await this.getCurrentStreak(action.type as any);
        if (streak && streak.current_streak % 7 === 0) {
          rewards.push({
            type: 'hearts',
            amount: Math.min(streak.current_streak / 7, 5),
            reason: `${streak.current_streak} días de racha ${action.type}`
          });
        }
      }

      // Daily engagement rewards
      const dailyRewards = await this.checkDailyThresholds();
      rewards.push(...dailyRewards);

      // Special action rewards
      const actionRewards = await this.getActionRewards(action);
      rewards.push(...actionRewards);

      // Apply rewards
      await this.applyRewards(rewards);

      return rewards;
    } catch (error) {
      console.error('Error tracking engagement action:', error);
      return [];
    }
  }

  // Update daily engagement score
  private async updateDailyScore(action: EngagementAction) {
    try {
      const score = ENGAGEMENT_SCORES[action.type] * (action.value || 1);
      const today = new Date().toISOString().split('T')[0];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Store daily score in user settings or create a new table
      await supabase
        .from('daily_engagement')
        .upsert({
          user_id: user.id,
          date: today,
          score: score,
          actions: { [action.type]: (action.value || 1) }
        }, {
          onConflict: 'user_id,date',
          ignoreDuplicates: false
        });

      this.dailyScore += score;
    } catch (error) {
      console.error('Error updating daily score:', error);
    }
  }

  // Check if user reached daily thresholds
  private async checkDailyThresholds(): Promise<EngagementReward[]> {
    const rewards: EngagementReward[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return rewards;

      const { data: dailyData } = await supabase
        .from('daily_engagement')
        .select('score, rewards_claimed')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (!dailyData) return rewards;

      const claimedRewards = dailyData.rewards_claimed || [];
      
      // Check thresholds and add unclaimed rewards
      if (dailyData.score >= DAILY_THRESHOLDS.active_user && 
          !claimedRewards.includes('active_user')) {
        rewards.push({
          type: 'hearts',
          amount: 2,
          reason: 'Usuario activo del día'
        });
      }

      if (dailyData.score >= DAILY_THRESHOLDS.super_active && 
          !claimedRewards.includes('super_active')) {
        rewards.push({
          type: 'hearts',
          amount: 5,
          reason: 'Super usuario activo'
        });
      }

      if (dailyData.score >= DAILY_THRESHOLDS.power_user && 
          !claimedRewards.includes('power_user')) {
        rewards.push({
          type: 'hearts',
          amount: 10,
          reason: 'Power user del día'
        });
        rewards.push({
          type: 'achievement',
          amount: 1,
          reason: 'Engagement extraordinario'
        });
      }

    } catch (error) {
      console.error('Error checking daily thresholds:', error);
    }

    return rewards;
  }

  // Get rewards for specific actions
  private async getActionRewards(action: EngagementAction): Promise<EngagementReward[]> {
    const rewards: EngagementReward[] = [];

    switch (action.type) {
      case 'login':
        // Daily login reward
        rewards.push({
          type: 'hearts',
          amount: 1,
          reason: 'Inicio de sesión diario'
        });
        break;

      case 'post':
        // First post of the day gets extra hearts
        if (action.metadata?.isFirstToday) {
          rewards.push({
            type: 'hearts',
            amount: 3,
            reason: 'Primera publicación del día'
          });
        }
        break;

      case 'story':
        rewards.push({
          type: 'hearts',
          amount: 2,
          reason: 'Historia compartida'
        });
        break;

      case 'interaction':
        // Bonus for being social
        if ((action.value || 0) >= 10) {
          rewards.push({
            type: 'social_score_boost',
            amount: 50,
            reason: 'Muy sociable hoy'
          });
        }
        break;
    }

    return rewards;
  }

  // Apply rewards to user
  private async applyRewards(rewards: EngagementReward[]) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      for (const reward of rewards) {
        switch (reward.type) {
          case 'hearts':
            await this.giveHeartsReward(user.id, reward.amount, reward.reason);
            break;
          case 'achievement':
            await awardAchievement('engagement_king', { reason: reward.reason });
            break;
          case 'social_score_boost':
            await updateSocialScore(user.id);
            break;
        }
      }
    } catch (error) {
      console.error('Error applying rewards:', error);
    }
  }

  // Give hearts as reward (different from user-given hearts)
  private async giveHeartsReward(userId: string, amount: number, reason: string) {
    try {
      await supabase
        .from('engagement_hearts')
        .insert({
          user_id: userId,
          hearts_received: amount,
          reason: reason,
          earned_at: new Date().toISOString()
        });

      // Crear notificación de corazones ganados por engagement
      if (amount >= 2) { // Solo notificar si gana 2 o más corazones
        await supabase
          .from('notifications')
          .insert({
            type: 'engagement_hearts_earned',
            receiver_id: userId,
            message: `Has ganado ${amount} corazones por ${reason.toLowerCase()}`
          });
      }
    } catch (error) {
      console.error('Error giving hearts reward:', error);
    }
  }

  // Get current streak for a type
  private async getCurrentStreak(type: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .eq('streak_type', type)
        .single();

      return data;
    } catch (error) {
      return null;
    }
  }

  // Get user's engagement summary
  async getEngagementSummary() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const today = new Date().toISOString().split('T')[0];

      const [dailyData, streaksData, heartsData] = await Promise.all([
        supabase
          .from('daily_engagement')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .single(),
        supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('engagement_hearts')
          .select('hearts_received')
          .eq('user_id', user.id)
          .gte('earned_at', today)
      ]);

      return {
        dailyScore: dailyData.data?.score || 0,
        streaks: streaksData.data || [],
        heartsEarnedToday: heartsData.data?.reduce((sum, h) => sum + h.hearts_received, 0) || 0,
        nextThreshold: this.getNextThreshold(dailyData.data?.score || 0)
      };
    } catch (error) {
      console.error('Error getting engagement summary:', error);
      return null;
    }
  }

  private getNextThreshold(currentScore: number) {
    if (currentScore < DAILY_THRESHOLDS.active_user) {
      return { name: 'Usuario Activo', target: DAILY_THRESHOLDS.active_user, progress: currentScore };
    }
    if (currentScore < DAILY_THRESHOLDS.super_active) {
      return { name: 'Super Activo', target: DAILY_THRESHOLDS.super_active, progress: currentScore };
    }
    if (currentScore < DAILY_THRESHOLDS.power_user) {
      return { name: 'Power User', target: DAILY_THRESHOLDS.power_user, progress: currentScore };
    }
    return { name: 'Máximo Nivel', target: DAILY_THRESHOLDS.power_user, progress: currentScore };
  }
}

// Global instance
export const engagementAlgorithm = EngagementAlgorithm.getInstance();