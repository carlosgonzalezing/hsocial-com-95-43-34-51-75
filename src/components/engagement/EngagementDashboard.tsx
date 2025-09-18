import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreakDisplay } from "./StreakDisplay";
import { AchievementBadges } from "./AchievementBadges";
import { EngagementStats } from "./EngagementStats";
import { useEngagement, useActivityTracker } from "@/hooks/use-engagement";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp } from "lucide-react";

interface EngagementDashboardProps {
  userId?: string;
}

export function EngagementDashboard({ userId }: EngagementDashboardProps) {
  const { refreshSocialScore, isLoading } = useEngagement(userId);
  const isOwnProfile = !userId; // If no userId provided, it's the current user's profile

  // Use activity tracker only for current user
  if (isOwnProfile) {
    useActivityTracker();
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Rachas Activas
              {isOwnProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refreshSocialScore()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreakDisplay userId={userId} showAll={false} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Logros Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <AchievementBadges userId={userId} compact />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Engagement Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <EngagementStats userId={userId} showDetails={false} />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
          <TabsTrigger value="streaks">Rachas</TabsTrigger>
          <TabsTrigger value="achievements">Logros</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          <EngagementStats userId={userId} />
        </TabsContent>

        <TabsContent value="streaks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Rachas</CardTitle>
            </CardHeader>
            <CardContent>
              <StreakDisplay userId={userId} showAll />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <AchievementBadges userId={userId} showAll />
        </TabsContent>
      </Tabs>

      {/* Motivational Section for Own Profile */}
      {isOwnProfile && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-blue-900">
                ¡Sigue así! 🚀
              </h3>
              <p className="text-blue-700 text-sm">
                Mantén tu actividad para subir de nivel y desbloquear nuevos logros.
                Cada interacción cuenta para tu puntuación social.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}