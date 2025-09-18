import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Lightbulb, Users, Clock, Target, MapPin, Briefcase, UserPlus } from "lucide-react";

interface CollaborationIdeaCardProps {
  idea: {
    id: string;
    title: string;
    description: string;
    category?: string;
    project_phase?: string;
    estimated_duration?: string;
    location_preference?: string;
    expected_impact?: string;
    needed_roles?: Array<{
      title: string;
      description: string;
      commitment_level: string;
      skills_desired?: string[];
    }>;
    resources_needed?: string[];
    collaboration_type?: string;
  };
}

export function CollaborationIdeaCard({ idea }: CollaborationIdeaCardProps) {
  const getPhaseColor = (phase?: string) => {
    switch (phase) {
      case 'ideation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'execution': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'launch': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'scaling': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getCommitmentColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                💡 Idea
              </Badge>
              {idea.project_phase && (
                <Badge className={getPhaseColor(idea.project_phase)}>
                  {idea.project_phase}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg text-foreground">{idea.title}</h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {idea.description}
        </p>

        {/* Project details */}
        <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
          {idea.category && (
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-1" />
              <span>{idea.category}</span>
            </div>
          )}
          {idea.estimated_duration && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{idea.estimated_duration}</span>
            </div>
          )}
          {idea.location_preference && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{idea.location_preference}</span>
            </div>
          )}
        </div>

        {/* Expected impact */}
        {idea.expected_impact && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start">
              <Target className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
              <div>
                <span className="text-sm font-medium text-blue-900">Impacto esperado:</span>
                <p className="text-sm text-blue-700">{idea.expected_impact}</p>
              </div>
            </div>
          </div>
        )}

        {/* Needed roles */}
        {idea.needed_roles && idea.needed_roles.length > 0 && (
          <div>
            <div className="flex items-center mb-2">
              <Users className="h-4 w-4 mr-2 text-purple-600" />
              <span className="text-sm font-medium text-foreground">Roles necesarios:</span>
            </div>
            <div className="space-y-2">
              {idea.needed_roles.slice(0, 2).map((role, index) => (
                <div key={index} className="border border-border rounded-lg p-3 bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-foreground">{role.title}</span>
                    <Badge className={getCommitmentColor(role.commitment_level)}>
                      {role.commitment_level}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                  {role.skills_desired && role.skills_desired.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {role.skills_desired.slice(0, 3).map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {idea.needed_roles.length > 2 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{idea.needed_roles.length - 2} roles más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Resources needed */}
        {idea.resources_needed && idea.resources_needed.length > 0 && (
          <div>
            <span className="text-sm font-medium text-foreground">Recursos necesarios:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {idea.resources_needed.slice(0, 4).map((resource, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {resource}
                </Badge>
              ))}
              {idea.resources_needed.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{idea.resources_needed.length - 4} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Collaboration type */}
        {idea.collaboration_type && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Modalidad:</span> {idea.collaboration_type}
          </div>
        )}

        {/* Join button */}
        <Button className="w-full bg-purple-600 hover:bg-purple-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Unirme a la idea
        </Button>
      </CardContent>
    </Card>
  );
}