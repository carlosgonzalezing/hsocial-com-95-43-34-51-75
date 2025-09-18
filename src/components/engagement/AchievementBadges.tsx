import { Trophy, Crown, Star, Users, Heart, Flame, Target, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEngagement } from "@/hooks/use-engagement";
import type { AchievementType } from "@/lib/api/engagement";

interface AchievementBadgesProps {
  userId?: string;
  showAll?: boolean;
  compact?: boolean;
}

const achievementIcons: Record<AchievementType, any> = {
  first_post: Star,
  social_butterfly: Users,
  popular_creator: Crown,
  heart_collector: Heart,
  story_master: Target,
  friend_magnet: Users,
  engagement_king: Flame,
  daily_user: Calendar,
};

const achievementLabels: Record<AchievementType, string> = {
  first_post: "Primera Publicación",
  social_butterfly: "Mariposa Social",
  popular_creator: "Creador Popular",
  heart_collector: "Coleccionista de Corazones",
  story_master: "Maestro de Historias",
  friend_magnet: "Imán de Amigos",
  engagement_king: "Rey del Engagement",
  daily_user: "Usuario Diario",
};

const achievementDescriptions: Record<AchievementType, string> = {
  first_post: "Hiciste tu primera publicación",
  social_butterfly: "Tienes 10+ amigos",
  popular_creator: "Tus posts son muy populares",
  heart_collector: "Recibiste 50+ corazones",
  story_master: "Maestro de las historias",
  friend_magnet: "Atraes muchos amigos",
  engagement_king: "Eres muy activo en la comunidad",
  daily_user: "7 días consecutivos activo",
};

const achievementColors: Record<AchievementType, string> = {
  first_post: "from-yellow-400 to-yellow-600",
  social_butterfly: "from-pink-400 to-pink-600",
  popular_creator: "from-purple-400 to-purple-600",
  heart_collector: "from-red-400 to-red-600",
  story_master: "from-blue-400 to-blue-600",
  friend_magnet: "from-green-400 to-green-600",
  engagement_king: "from-orange-400 to-orange-600",
  daily_user: "from-indigo-400 to-indigo-600",
};

export function AchievementBadges({ userId, showAll = false, compact = false }: AchievementBadgesProps) {
  const { achievements, isLoading } = useEngagement(userId);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-24 bg-muted rounded-lg"></div>
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {userId ? "Este usuario aún no tiene logros" : "¡Sigue participando para desbloquear logros!"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayAchievements = showAll ? achievements : achievements.slice(0, 6);

  if (compact) {
    return (
      <div className="flex gap-1 flex-wrap">
        {displayAchievements.map((achievement) => {
          const Icon = achievementIcons[achievement.achievement_type];
          const colorClass = achievementColors[achievement.achievement_type];
          
          return (
            <div
              key={achievement.id}
              className={`p-2 rounded-lg bg-gradient-to-br ${colorClass} text-white shadow-sm`}
              title={achievementLabels[achievement.achievement_type]}
            >
              <Icon className="h-4 w-4" />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Logros ({achievements.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {displayAchievements.map((achievement) => {
            const Icon = achievementIcons[achievement.achievement_type];
            const label = achievementLabels[achievement.achievement_type];
            const description = achievementDescriptions[achievement.achievement_type];
            const colorClass = achievementColors[achievement.achievement_type];
            
            return (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg bg-gradient-to-br ${colorClass} text-white text-center transition-transform hover:scale-105`}
              >
                <Icon className="h-6 w-6 mx-auto mb-1" />
                <div className="text-xs font-medium mb-1">{label}</div>
                <div className="text-xs opacity-90">{description}</div>
              </div>
            );
          })}
        </div>
        
        {!showAll && achievements.length > 6 && (
          <div className="mt-3 text-center">
            <Badge variant="outline" className="text-xs">
              +{achievements.length - 6} más
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}