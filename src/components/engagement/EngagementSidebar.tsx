import React from "react";
import { EngagementTracker } from "@/components/engagement/EngagementTracker";
import { Card } from "@/components/ui/card";
import { useEngagement } from "@/hooks/use-engagement";
import { useAuth } from "@/hooks/use-auth";

export function EngagementSidebar() {
  const { user } = useAuth();
  const { 
    loginStreak, 
    postStreak, 
    socialScore, 
    engagementScore,
    achievementCount,
    hasErrors 
  } = useEngagement(user?.id);

  if (!user) return null;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Tu Progreso</h3>
        
        {hasErrors && (
          <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md">
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Algunos datos pueden no estar actualizados
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          {/* Streaks */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-muted/50 rounded">
              <div className="font-bold text-lg">{loginStreak?.current_streak || 0}</div>
              <div className="text-xs text-muted-foreground">Días seguidos</div>
            </div>
            <div className="p-2 bg-muted/50 rounded">
              <div className="font-bold text-lg">{postStreak?.current_streak || 0}</div>
              <div className="text-xs text-muted-foreground">Posts seguidos</div>
            </div>
          </div>

          {/* Scores */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Puntuación Social</span>
              <span className="font-semibold">{socialScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Engagement</span>
              <span className="font-semibold">{engagementScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Logros</span>
              <span className="font-semibold">{achievementCount}</span>
            </div>
          </div>
        </div>
      </Card>

      <EngagementTracker />
    </div>
  );
}