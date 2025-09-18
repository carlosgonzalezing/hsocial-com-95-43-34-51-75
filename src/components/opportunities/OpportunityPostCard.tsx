import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, DollarSign, Users, Calendar, Briefcase, GraduationCap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export interface OpportunityData {
  id: string;
  type: 'mentorship' | 'internship' | 'event' | 'job';
  title: string;
  description: string;
  author: {
    username: string;
    avatar_url?: string;
  };
  created_at: string;
  // Type-specific fields
  company_name?: string;
  location?: string;
  is_free?: boolean;
  hourly_rate?: number;
  start_date?: string;
  specialties?: string[];
}

interface OpportunityPostCardProps {
  opportunity: OpportunityData;
  onAction: (id: string, type: string) => void;
}

export function OpportunityPostCard({ opportunity, onAction }: OpportunityPostCardProps) {
  const getIcon = () => {
    switch (opportunity.type) {
      case 'mentorship': return Users;
      case 'internship': return Briefcase;
      case 'event': return Calendar;
      case 'job': return GraduationCap;
      default: return Briefcase;
    }
  };

  const getTypeLabel = () => {
    switch (opportunity.type) {
      case 'mentorship': return 'Mentoría';
      case 'internship': return 'Práctica';
      case 'event': return 'Evento';
      case 'job': return 'Empleo';
      default: return 'Oportunidad';
    }
  };

  const getActionLabel = () => {
    switch (opportunity.type) {
      case 'mentorship': return 'Agendar';
      case 'internship': return 'Aplicar';
      case 'event': return 'Registrarse';
      case 'job': return 'Aplicar';
      default: return 'Ver más';
    }
  };

  const Icon = getIcon();

  return (
    <Card className="h-full hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={opportunity.author.avatar_url} />
            <AvatarFallback>
              {opportunity.author.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-4 w-4 text-primary" />
              <Badge variant="secondary" className="text-xs">
                {getTypeLabel()}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-1">
              {opportunity.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              por @{opportunity.author.username}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-0">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {opportunity.description}
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {opportunity.company_name && (
            <div className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              <span>{opportunity.company_name}</span>
            </div>
          )}
          {opportunity.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{opportunity.location}</span>
            </div>
          )}
          {opportunity.is_free !== undefined && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>{opportunity.is_free ? 'Gratis' : `$${opportunity.hourly_rate?.toLocaleString()}`}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true, locale: es })}</span>
          </div>
        </div>

        {opportunity.specialties && opportunity.specialties.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {opportunity.specialties.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {opportunity.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{opportunity.specialties.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4">
        <Button 
          onClick={() => onAction(opportunity.id, opportunity.type)}
          className="w-full"
          size="sm"
        >
          {getActionLabel()}
        </Button>
      </CardFooter>
    </Card>
  );
}