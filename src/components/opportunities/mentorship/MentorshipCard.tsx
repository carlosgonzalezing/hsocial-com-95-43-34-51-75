import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, Users, Calendar } from "lucide-react";
import { Mentorship } from "@/types/education";

interface MentorshipCardProps {
  mentorship: Mentorship;
  onBookSession?: (mentorshipId: string) => void;
}

export function MentorshipCard({ mentorship, onBookSession }: MentorshipCardProps) {
  const mentor = mentorship.mentor;

  const formatAvailability = () => {
    if (!mentorship.availability?.days?.length) return "Horarios flexibles";
    
    const days = mentorship.availability.days.join(", ");
    const hours = mentorship.availability.hours 
      ? `${mentorship.availability.hours.start} - ${mentorship.availability.hours.end}`
      : "";
    
    return `${days} ${hours}`;
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={mentor?.avatar_url || ""} alt={mentor?.username || ""} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {mentor?.username?.charAt(0)?.toUpperCase() || "M"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-1">{mentor?.username || "Mentor"}</CardTitle>
            <p className="text-sm text-muted-foreground mb-2">{mentor?.career || "Profesional"}</p>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-medium">{mentorship.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({mentorship.total_reviews})</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{mentorship.total_sessions} sesiones</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Specialties */}
        <div>
          <h4 className="font-medium mb-2">Especialidades</h4>
          <div className="flex flex-wrap gap-1">
            {mentorship.specialties.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {mentorship.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{mentorship.specialties.length - 3} más
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        {mentorship.description && (
          <div>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {mentorship.description}
            </p>
          </div>
        )}

        {/* Session Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{mentorship.session_duration} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Máx. {mentorship.max_students_per_session} estudiantes</span>
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Disponibilidad</p>
            <p className="text-xs text-muted-foreground">{formatAvailability()}</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <span className="text-sm font-medium">Precio por sesión</span>
          <span className="font-bold text-lg">
            {mentorship.is_free ? (
              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                Gratis
              </Badge>
            ) : (
              `$${mentorship.hourly_rate.toLocaleString()}`
            )}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          onClick={() => onBookSession?.(mentorship.id)}
          className="w-full"
          variant="default"
        >
          Agendar Sesión
        </Button>
      </CardFooter>
    </Card>
  );
}