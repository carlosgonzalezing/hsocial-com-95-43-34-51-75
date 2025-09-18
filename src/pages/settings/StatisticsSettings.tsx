import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Heart, Eye, TrendingUp, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EngagementStats } from "@/components/engagement/EngagementStats";
import { SocialLevelBadge } from "@/components/engagement/SocialLevelBadge";
import { useEngagement } from "@/hooks/use-engagement";

export default function StatisticsSettings() {
  const navigate = useNavigate();
  const { 
    profileViewsToday, 
    profileViewsTotal, 
    socialScore, 
    engagementScore,
    achievements 
  } = useEngagement();

  const quickStats = [
    {
      icon: Heart,
      label: "Corazones Ganados",
      value: Math.round(engagementScore),
      description: "Total de corazones por engagement",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/20"
    },
    {
      icon: Eye,
      label: "Vistas de Perfil",
      value: profileViewsTotal,
      description: "Personas que han visto tu perfil",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      icon: TrendingUp,
      label: "Puntuación Social",
      value: Math.round(socialScore),
      description: "Tu nivel de popularidad",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      icon: Award,
      label: "Logros Obtenidos",
      value: achievements?.length || 0,
      description: "Achievements desbloqueados",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b p-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Mis Estadísticas</h1>
        <p className="text-muted-foreground">Ve tu progreso y estadísticas de engagement</p>
      </div>
      
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        {/* Social Level Badge */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Tu Nivel Social
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SocialLevelBadge 
              socialScore={socialScore} 
              variant="banner" 
              showProgress={true}
            />
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`${stat.bgColor} p-3 rounded-lg mb-3`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                    <div className="text-sm font-medium text-foreground">{stat.label}</div>
                    <div className="text-xs text-muted-foreground">{stat.description}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Engagement Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estadísticas Detalladas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EngagementStats showDetails={true} />
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumen de Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {profileViewsToday}
                </div>
                <div className="text-sm text-muted-foreground">Vistas hoy</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {Math.round((profileViewsToday / Math.max(profileViewsTotal, 1)) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">% del total hoy</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {socialScore >= 1000 ? "⭐" : socialScore >= 500 ? "🔥" : socialScore >= 200 ? "📈" : "🌱"}
                </div>
                <div className="text-sm text-muted-foreground">Estado actual</div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Consejos para mejorar:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Publica contenido regularmente para aumentar tu engagement</li>
                <li>• Interactúa con otros usuarios para ganar más corazones</li>
                <li>• Completa tu perfil para atraer más vistas</li>
                <li>• Participa en eventos y mentorías para subir de nivel</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}