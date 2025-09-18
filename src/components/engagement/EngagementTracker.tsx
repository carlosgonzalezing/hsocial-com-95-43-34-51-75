import { useEffect, useState } from "react";
import { engagementAlgorithm, type EngagementReward } from "@/lib/engagement/algorithm";
import { useToast } from "@/hooks/use-toast";
import { Heart, Trophy, Star, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export function EngagementTracker() {
  const { toast } = useToast();
  const [summary, setSummary] = useState<any>(null);
  const [recentRewards, setRecentRewards] = useState<EngagementReward[]>([]);

  useEffect(() => {
    loadEngagementSummary();
    
    // Listen for engagement events
    const handleEngagement = (event: CustomEvent<EngagementReward[]>) => {
      setRecentRewards(prev => [...event.detail, ...prev].slice(0, 5));
      showRewardsToast(event.detail);
      loadEngagementSummary(); // Refresh summary
    };

    window.addEventListener('engagement-reward' as any, handleEngagement);
    return () => window.removeEventListener('engagement-reward' as any, handleEngagement);
  }, []);

  const loadEngagementSummary = async () => {
    const data = await engagementAlgorithm.getEngagementSummary();
    setSummary(data);
  };

  const showRewardsToast = (rewards: EngagementReward[]) => {
    rewards.forEach(reward => {
      const icon = reward.type === 'hearts' ? '💖' : 
                   reward.type === 'achievement' ? '🏆' : '⭐';
      
      toast({
        title: `${icon} ¡Recompensa obtenida!`,
        description: `+${reward.amount} ${reward.type === 'hearts' ? 'corazones' : 
                      reward.type === 'achievement' ? 'logro' : 'puntos sociales'} - ${reward.reason}`,
        duration: 4000,
      });
    });
  };

  if (!summary) return null;

  const progressPercentage = summary.nextThreshold ? 
    (summary.nextThreshold.progress / summary.nextThreshold.target) * 100 : 100;

  return (
    <div className="space-y-4">
      {/* Daily Progress Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Progreso Diario</h3>
          </div>
          <Badge variant="secondary">{summary.dailyScore} pts</Badge>
        </div>

        {summary.nextThreshold && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{summary.nextThreshold.name}</span>
              <span>{summary.nextThreshold.progress}/{summary.nextThreshold.target}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="font-semibold">{summary.heartsEarnedToday}</span>
            </div>
            <p className="text-xs text-muted-foreground">Corazones hoy</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{summary.streaks.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Rachas activas</p>
          </div>
        </div>
      </Card>

      {/* Recent Rewards */}
      <AnimatePresence>
        {recentRewards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-muted-foreground">Recompensas recientes</h4>
            {recentRewards.slice(0, 3).map((reward, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
              >
                {reward.type === 'hearts' && <Heart className="h-4 w-4 text-red-500" />}
                {reward.type === 'achievement' && <Trophy className="h-4 w-4 text-yellow-500" />}
                {reward.type === 'social_score_boost' && <Star className="h-4 w-4 text-blue-500" />}
                
                <div className="flex-1">
                  <p className="text-sm font-medium">+{reward.amount}</p>
                  <p className="text-xs text-muted-foreground">{reward.reason}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}