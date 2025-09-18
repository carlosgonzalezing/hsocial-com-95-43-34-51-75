import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Trophy, Users, DollarSign, ExternalLink, Github, Play, Heart, MessageCircle } from "lucide-react";

interface ProjectShowcaseCardProps {
  project: {
    id: string;
    project_title: string;
    project_description: string;
    project_status: string;
    technologies_used?: string[];
    project_url?: string;
    github_url?: string;
    demo_url?: string;
    team_size?: number;
    seeking_investment?: boolean;
    seeking_collaborators?: boolean;
    funding_needed?: number;
    revenue_generated?: number;
    user_base?: number;
    achievements?: string[];
    industry?: string;
  };
}

export function ProjectShowcaseCard({ project }: ProjectShowcaseCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ongoing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'seeking_team': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: "Completado",
      ongoing: "En desarrollo",
      planning: "Planeando",
      seeking_team: "Buscando equipo"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-green-600" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                🚀 Proyecto
              </Badge>
              <Badge className={getStatusColor(project.project_status)}>
                {getStatusLabel(project.project_status)}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg text-foreground">{project.project_title}</h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {project.project_description}
        </p>

        {/* Technologies */}
        {project.technologies_used && project.technologies_used.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.technologies_used.slice(0, 4).map((tech, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {project.technologies_used.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{project.technologies_used.length - 4} más
              </Badge>
            )}
          </div>
        )}

        {/* Project metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {project.team_size && (
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span>{project.team_size} miembros</span>
            </div>
          )}
          {project.user_base && (
            <div className="flex items-center text-muted-foreground">
              <Heart className="h-4 w-4 mr-1" />
              <span>{formatNumber(project.user_base)} usuarios</span>
            </div>
          )}
        </div>

        {/* Investment/Revenue info */}
        {(project.seeking_investment || project.revenue_generated) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            {project.seeking_investment && project.funding_needed && (
              <div className="flex items-center text-yellow-700 mb-1">
                <DollarSign className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">
                  Buscando inversión: {formatCurrency(project.funding_needed)}
                </span>
              </div>
            )}
            {project.revenue_generated && (
              <div className="flex items-center text-green-700">
                <DollarSign className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">
                  Ingresos generados: {formatCurrency(project.revenue_generated)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Achievements */}
        {project.achievements && project.achievements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Logros:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {project.achievements.slice(0, 2).map((achievement, index) => (
                <li key={index} className="flex items-center">
                  <Trophy className="h-3 w-3 mr-2 text-yellow-500" />
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {project.project_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Ver proyecto
              </a>
            </Button>
          )}
          {project.github_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-1" />
                Código
              </a>
            </Button>
          )}
          {project.demo_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                <Play className="h-4 w-4 mr-1" />
                Demo
              </a>
            </Button>
          )}
        </div>

        {/* Interest buttons */}
        <div className="flex gap-2">
          {project.seeking_investment && (
            <Button size="sm" className="flex-1 bg-yellow-600 hover:bg-yellow-700">
              <DollarSign className="h-4 w-4 mr-2" />
              Invertir
            </Button>
          )}
          {project.seeking_collaborators && (
            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
              <Users className="h-4 w-4 mr-2" />
              Colaborar
            </Button>
          )}
          {!project.seeking_investment && !project.seeking_collaborators && (
            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contactar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}