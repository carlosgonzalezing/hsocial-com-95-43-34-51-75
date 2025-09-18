import { Eye, TrendingUp, Users, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEngagement } from "@/hooks/use-engagement";
import { SocialLevelBadge } from "./SocialLevelBadge";
import { ProfileViewersDialog } from "./ProfileViewersDialog";

interface EngagementStatsProps {
  userId?: string;
  showDetails?: boolean;
}

export function EngagementStats({ userId, showDetails = true }: EngagementStatsProps) {
  const { 
    metrics, 
    profileViewsToday, 
    profileViewsTotal, 
    socialScore, 
    engagementScore,
    isLoading 
  } = useEngagement(userId);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-6 bg-muted rounded"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const getSocialScoreLevel = (score: number): { label: string; color: string } => {
    if (score >= 1000) return { label: "Súper Star", color: "from-purple-500 to-pink-500" };
    if (score >= 500) return { label: "Influencer", color: "from-blue-500 to-purple-500" };
    if (score >= 200) return { label: "Popular", color: "from-green-500 to-blue-500" };
    if (score >= 50) return { label: "Activo", color: "from-yellow-500 to-green-500" };
    return { label: "Principiante", color: "from-gray-500 to-yellow-500" };
  };

  const scoreLevel = getSocialScoreLevel(socialScore);

  const stats = [
    {
      icon: Eye,
      label: "Vistas Hoy",
      value: profileViewsToday,
      total: profileViewsTotal,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: TrendingUp,
      label: "Puntuación Social",
      value: Math.round(socialScore),
      subtitle: scoreLevel.label,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Zap,
      label: "Engagement",
      value: Math.round(engagementScore),
      subtitle: "Score",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Users,
      label: "Vistas Totales",
      value: profileViewsTotal,
      subtitle: "Perfil",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  if (!showDetails) {
    return (
      <div className="flex items-center gap-3">
        <SocialLevelBadge socialScore={socialScore} variant="compact" />
        <ProfileViewersDialog>
          <Button variant="ghost" size="sm" className="h-auto p-1 text-muted-foreground hover:text-foreground">
            <div className="text-sm">
              {profileViewsToday} vista{profileViewsToday !== 1 ? 's' : ''} hoy
            </div>
          </Button>
        </ProfileViewersDialog>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estadísticas de Engagement
          </span>
          <Badge 
            variant="secondary" 
            className={`bg-gradient-to-r ${scoreLevel.color} text-white`}
          >
            {scoreLevel.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} p-4 rounded-lg border transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  {stat.subtitle && (
                    <div className="text-xs font-medium text-muted-foreground">
                      {stat.subtitle}
                    </div>
                  )}
                  {stat.total && stat.total !== stat.value && (
                    <div className="text-xs text-muted-foreground">
                      de {stat.total.toLocaleString()} total
                    </div>
                  )}
                  {stat.label === "Vistas Hoy" && (
                    <ProfileViewersDialog>
                      <Button variant="ghost" size="sm" className="mt-1 text-xs p-1 h-auto">
                        Ver detalles
                      </Button>
                    </ProfileViewersDialog>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Enhanced Social Level Display */}
        <div className="mt-4">
          <SocialLevelBadge 
            socialScore={socialScore} 
            variant="banner" 
            showProgress={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}