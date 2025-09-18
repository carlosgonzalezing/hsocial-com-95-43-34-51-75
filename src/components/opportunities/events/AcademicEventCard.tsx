import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  DollarSign,
  Award,
  Video,
  ExternalLink
} from "lucide-react";
import { AcademicEvent } from "@/types/education";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface AcademicEventCardProps {
  event: AcademicEvent;
  onRegister?: (eventId: string) => void;
}

export function AcademicEventCard({ event, onRegister }: AcademicEventCardProps) {
  const isUpcoming = event.status === 'upcoming';
  const isLive = event.status === 'live';
  const isFull = event.max_attendees ? event.current_attendees >= event.max_attendees : false;
  
  const hasRegistrationDeadline = event.registration_deadline;
  const isRegistrationOpen = !hasRegistrationDeadline || 
    new Date(event.registration_deadline) > new Date();

  const getEventTypeLabel = (type: string) => {
    const labels = {
      conference: "Conferencia",
      seminar: "Seminario", 
      workshop: "Taller",
      hackathon: "Hackathon",
      webinar: "Webinar",
      networking: "Networking",
      career_fair: "Feria de Empleo"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusColor = () => {
    switch (event.status) {
      case 'live': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatEventDate = () => {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    
    if (format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
      // Same day event
      return `${format(startDate, 'dd MMM yyyy', { locale: es })} • ${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`;
    } else {
      // Multi-day event
      return `${format(startDate, 'dd MMM', { locale: es })} - ${format(endDate, 'dd MMM yyyy', { locale: es })}`;
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {getEventTypeLabel(event.event_type)}
              </Badge>
              <Badge className={`text-xs ${getStatusColor()}`}>
                {isLive ? 'EN VIVO' : isUpcoming ? 'Próximo' : event.status}
              </Badge>
            </div>
            <CardTitle className="text-lg mb-2 line-clamp-2">{event.title}</CardTitle>
            {event.organizer_name && (
              <p className="text-sm text-muted-foreground">Por {event.organizer_name}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-3">
          {/* Date and Time */}
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">{formatEventDate()}</p>
              {isUpcoming && (
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(event.start_date), { addSuffix: true, locale: es })}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            {event.is_virtual ? (
              <>
                <Video className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Evento virtual</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{event.location || "Ubicación por confirmar"}</span>
              </>
            )}
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {event.current_attendees} asistentes
              {event.max_attendees && ` / ${event.max_attendees} máx`}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {event.is_free ? 'Gratis' : `$${event.ticket_price.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Target Audience */}
        {event.target_audience.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 text-sm">Dirigido a</h4>
            <div className="flex flex-wrap gap-1">
              {event.target_audience.slice(0, 3).map((audience, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {audience}
                </Badge>
              ))}
              {event.target_audience.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{event.target_audience.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Certificates */}
        {event.certificates_available && (
          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <Award className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">Certificado disponible</span>
          </div>
        )}

        {/* Speakers */}
        {event.speakers.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 text-sm">Ponentes destacados</h4>
            <div className="space-y-1">
              {event.speakers.slice(0, 2).map((speaker, index) => (
                <p key={index} className="text-xs text-muted-foreground">
                  • {speaker.name}
                </p>
              ))}
              {event.speakers.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  • Y {event.speakers.length - 2} ponentes más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Registration Deadline */}
        {hasRegistrationDeadline && isRegistrationOpen && (
          <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
            <Clock className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-800">Registro hasta</p>
              <p className="text-xs text-orange-600">
                {format(new Date(event.registration_deadline!), 'dd MMM yyyy, HH:mm', { locale: es })}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {isLive && event.meeting_link ? (
          <Button asChild className="flex-1" variant="destructive">
            <a href={event.meeting_link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Unirse Ahora
            </a>
          </Button>
        ) : isUpcoming && event.registration_required ? (
          <Button 
            onClick={() => onRegister?.(event.id)}
            className="flex-1"
            disabled={isFull || !isRegistrationOpen}
          >
            {isFull ? 'Lleno' : !isRegistrationOpen ? 'Registro cerrado' : 'Registrarse'}
          </Button>
        ) : (
          <Button 
            onClick={() => onRegister?.(event.id)}
            className="flex-1"
            variant="outline"
          >
            Ver Detalles
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}