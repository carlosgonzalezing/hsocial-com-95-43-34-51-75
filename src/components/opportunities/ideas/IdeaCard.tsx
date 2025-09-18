import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Users, Lightbulb } from "lucide-react";

interface IdeaAuthor {
  id: string;
  username: string;
  avatar_url?: string;
  career?: string;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  max_participants: number;
  deadline?: string;
  created_at: string;
  author: IdeaAuthor;
}

interface IdeaCardProps {
  idea: Idea;
  onJoin: (ideaId: string) => void;
}

export function IdeaCard({ idea, onJoin }: IdeaCardProps) {
  const handleJoin = () => {
    onJoin(idea.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={idea.author.avatar_url} />
            <AvatarFallback>
              {idea.author.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              por @{idea.author.username}
            </p>
            {idea.author.career && (
              <p className="text-xs text-muted-foreground">
                {idea.author.career}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {idea.description}
        </p>
        
        {idea.required_skills && idea.required_skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium mb-2">Habilidades requeridas:</p>
            <div className="flex flex-wrap gap-1">
              {idea.required_skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {idea.required_skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{idea.required_skills.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>Max {idea.max_participants}</span>
          </div>
          {idea.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(idea.deadline)}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleJoin} 
          className="w-full"
          size="sm"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          Unirse a la Idea
        </Button>
      </CardFooter>
    </Card>
  );
}