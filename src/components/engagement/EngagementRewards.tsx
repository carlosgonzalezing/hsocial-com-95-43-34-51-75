import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Heart, Flame, Trophy, Gift, Zap, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface EngagementReward {
  id: string;
  reward_type: string;
  hearts_earned: number;
  points_earned: number;
  description: string;
  earned_at: string;
  metadata?: any;
}

interface DailyGoal {
  name: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  icon: any;
  completed: boolean;
}

export function EngagementRewards() {
  const [recentRewards, setRecentRewards] = useState<EngagementReward[]>([]);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [totalHeartsToday, setTotalHeartsToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEngagementData();
  }, []);

  const loadEngagementData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load recent rewards
      const { data: rewards } = await supabase
        .from('engagement_rewards_log')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(10);

      setRecentRewards(rewards || []);

      // Calculate today's hearts
      const today = new Date().toISOString().split('T')[0];
      const todayRewards = (rewards || []).filter(r => 
        r.earned_at.startsWith(today)
      );
      const todayHearts = todayRewards.reduce((sum, r) => sum + r.hearts_earned, 0);
      setTotalHeartsToday(todayHearts);

      // Check if daily login bonus can be claimed
      const hasClaimedToday = todayRewards.some(r => r.reward_type === 'daily_login');
      setCanClaimDaily(!hasClaimedToday);

      // Generate daily goals (simplified version)
      const goals: DailyGoal[] = [
        {
          name: "Inicio de Sesión",
          description: "Inicia sesión para obtener tu bonificación diaria",
          target: 1,
          current: hasClaimedToday ? 1 : 0,
          reward: 1,
          icon: Calendar,
          completed: hasClaimedToday
        },
        {
          name: "Actividad Social",
          description: "Interactúa con otros usuarios",
          target: 5,
          current: Math.min(todayRewards.filter(r => r.reward_type === 'interaction').length, 5),
          reward: 2,
          icon: Zap,
          completed: todayRewards.filter(r => r.reward_type === 'interaction').length >= 5
        },
        {
          name: "Corazones del Día",
          description: "Recibe corazones de engagement",
          target: 5,
          current: Math.min(todayHearts, 5),
          reward: 3,
          icon: Heart,
          completed: todayHearts >= 5
        }
      ];

      setDailyGoals(goals);
    } catch (error) {
      console.error('Error loading engagement data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const claimDailyBonus = async () => {
    try {
      const { error } = await supabase.rpc('award_daily_login_bonus');
      
      if (error) throw error;

      toast({
        title: "¡Bonificación Reclamada!",
        description: "Has recibido 1 corazón por iniciar sesión hoy",
      });

      // Reload data
      loadEngagementData();
    } catch (error) {
      console.error('Error claiming daily bonus:', error);
      toast({
        title: "Error",
        description: "No se pudo reclamar la bonificación diaria",
        variant: "destructive"
      });
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'daily_login': return Calendar;
      case 'first_post': return Trophy;
      case 'activity_goal': return Zap;
      case 'streak_bonus': return Flame;
      case 'level_up': return Gift;
      default: return Heart;
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'daily_login': return 'bg-blue-500';
      case 'first_post': return 'bg-yellow-500';
      case 'activity_goal': return 'bg-green-500';
      case 'streak_bonus': return 'bg-orange-500';
      case 'level_up': return 'bg-purple-500';
      default: return 'bg-pink-500';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Daily Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5" />
            Objetivos Diarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canClaimDaily && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Bonificación Diaria Disponible
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Reclama tu corazón diario
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={claimDailyBonus}>
                  Reclamar
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-3">
            {dailyGoals.map((goal, index) => {
              const Icon = goal.icon;
              const progressPercentage = (goal.current / goal.target) * 100;
              
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className={`p-2 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-muted'}`}>
                    <Icon className={`h-4 w-4 ${goal.completed ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{goal.name}</h4>
                      <Badge variant={goal.completed ? "default" : "secondary"} className="text-xs">
                        +{goal.reward} 💝
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{goal.description}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={progressPercentage} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5" />
            Recompensas Recientes
            <Badge variant="outline" className="ml-auto">
              {totalHeartsToday} 💝 hoy
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRewards.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {recentRewards.map((reward) => {
                const Icon = getRewardIcon(reward.reward_type);
                const colorClass = getRewardColor(reward.reward_type);
                
                return (
                  <div key={reward.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className={`p-2 rounded-full ${colorClass} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{reward.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reward.earned_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      +{reward.hearts_earned} 💝
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aún no hay recompensas</p>
              <p className="text-xs">¡Mantente activo para ganar corazones!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}