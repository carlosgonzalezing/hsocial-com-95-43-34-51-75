import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, GraduationCap, Calendar, Building } from 'lucide-react';
import { UniversityFriendSuggestion } from '@/hooks/use-university-suggestions';

interface UniversityConnectionCardProps {
  suggestion: UniversityFriendSuggestion;
  onConnect: (userId: string) => void;
  loading?: boolean;
}

export function UniversityConnectionCard({ 
  suggestion, 
  onConnect, 
  loading = false 
}: UniversityConnectionCardProps) {
  const getRelevanceColor = (score: number) => {
    if (score >= 10) return 'bg-red-500 text-white';
    if (score >= 7) return 'bg-orange-500 text-white';
    if (score >= 5) return 'bg-blue-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getRelevanceLabel = (score: number) => {
    if (score >= 10) return 'Alta';
    if (score >= 7) return 'Media-Alta';
    if (score >= 5) return 'Media';
    return 'Baja';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={suggestion.avatar_url || undefined} />
            <AvatarFallback>
              {suggestion.username?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm truncate">
                {suggestion.username}
              </h3>
              <Badge 
                className={`text-xs ${getRelevanceColor(suggestion.relevance_score)}`}
              >
                {getRelevanceLabel(suggestion.relevance_score)}
              </Badge>
            </div>

            <div className="space-y-1 mb-3">
              {suggestion.institution_name && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Building className="h-3 w-3 mr-1" />
                  <span className="truncate">{suggestion.institution_name}</span>
                </div>
              )}
              
              {suggestion.career && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  <span className="truncate">{suggestion.career}</span>
                </div>
              )}
              
              {suggestion.semester && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Semestre {suggestion.semester}</span>
                </div>
              )}
            </div>

            <div className="mb-3">
              <p className="text-xs text-primary font-medium">
                {suggestion.connection_reason}
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => onConnect(suggestion.id)}
              disabled={loading}
              className="w-full"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Conectar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}