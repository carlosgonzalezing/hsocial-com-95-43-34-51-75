import { Flame, Calendar, Users, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useEngagement } from "@/hooks/use-engagement";
import type { StreakType } from "@/lib/api/engagement";

interface StreakDisplayProps {
  userId?: string;
  showAll?: boolean;
  compact?: boolean;
}

const streakIcons: Record<StreakType, any> = {
  login: Calendar,
  post: Heart,
  story: Users,
  interaction: Flame,
};

const streakLabels: Record<StreakType, string> = {
  login: "Días Activo",
  post: "Posts Seguidos",
  story: "Stories Diarias",
  interaction: "Interacciones",
};

const streakColors: Record<StreakType, string> = {
  login: "bg-gradient-to-r from-blue-500 to-blue-600",
  post: "bg-gradient-to-r from-pink-500 to-rose-600",
  story: "bg-gradient-to-r from-purple-500 to-violet-600",
  interaction: "bg-gradient-to-r from-orange-500 to-amber-600",
};

export function StreakDisplay({ userId, showAll = false, compact = false }: StreakDisplayProps) {
  const { streaks, isLoading } = useEngagement(userId);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-muted rounded-lg"></div>
      </div>
    );
  }

  const displayStreaks = showAll ? streaks : streaks.slice(0, 2);

  if (compact) {
    return (
      <div className="flex gap-2 flex-wrap">
        {displayStreaks.map((streak) => {
          const Icon = streakIcons[streak.streak_type];
          return (
            <Badge
              key={streak.streak_type}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              <Icon className="h-3 w-3" />
              <span className="font-bold">{streak.current_streak}</span>
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {displayStreaks.map((streak) => {
        const Icon = streakIcons[streak.streak_type];
        const label = streakLabels[streak.streak_type];
        const colorClass = streakColors[streak.streak_type];

        return (
          <Card key={streak.streak_type} className="overflow-hidden">
            <CardContent className={`p-4 text-white ${colorClass}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{streak.current_streak}</div>
                  <div className="text-xs opacity-90">
                    Récord: {streak.longest_streak}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}