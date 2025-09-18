import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar, 
  Users, 
  GraduationCap,
  Building2,
  Wifi
} from "lucide-react";
import { Internship } from "@/types/education";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface InternshipCardProps {
  internship: Internship;
  onApply?: (internshipId: string) => void;
}

export function InternshipCard({ internship, onApply }: InternshipCardProps) {
  const hasDeadline = internship.application_deadline;
  const isNearDeadline = hasDeadline && 
    new Date(internship.application_deadline!) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const formatDeadline = () => {
    if (!hasDeadline) return null;
    return formatDistanceToNow(new Date(internship.application_deadline!), {
      addSuffix: true,
      locale: es
    });
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={internship.company_logo_url || ""} alt={internship.company_name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {internship.company_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-1">{internship.position_title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Building2 className="h-4 w-4" />
              <span>{internship.company_name}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              {internship.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{internship.location}</span>
                </div>
              )}
              {internship.is_remote && (
                <div className="flex items-center gap-1">
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Remoto</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {internship.description}
        </p>

        {/* Key Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {internship.duration_months && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{internship.duration_months} meses</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>
              {internship.is_paid ? 
                `$${internship.stipend_amount.toLocaleString()}` : 
                "No remunerada"
              }
            </span>
          </div>

          {internship.required_semester && (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span>{internship.required_semester} semestre</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{internship.current_applications}/{internship.max_applications} postulados</span>
          </div>
        </div>

        {/* Required Careers */}
        {internship.required_careers.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Carreras requeridas</h4>
            <div className="flex flex-wrap gap-1">
              {internship.required_careers.slice(0, 2).map((career, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {career}
                </Badge>
              ))}
              {internship.required_careers.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{internship.required_careers.length - 2} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Skills to Develop */}
        {internship.skills_to_develop.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Habilidades a desarrollar</h4>
            <div className="flex flex-wrap gap-1">
              {internship.skills_to_develop.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {internship.skills_to_develop.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{internship.skills_to_develop.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Deadline Warning */}
        {hasDeadline && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            isNearDeadline ? 'bg-orange-50 border border-orange-200' : 'bg-muted/30'
          }`}>
            <Calendar className={`h-4 w-4 ${isNearDeadline ? 'text-orange-600' : 'text-muted-foreground'}`} />
            <div>
              <p className={`text-sm font-medium ${isNearDeadline ? 'text-orange-800' : ''}`}>
                Fecha límite
              </p>
              <p className={`text-xs ${isNearDeadline ? 'text-orange-600' : 'text-muted-foreground'}`}>
                {formatDeadline()}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          onClick={() => onApply?.(internship.id)}
          className="w-full"
          disabled={internship.current_applications >= internship.max_applications}
          variant={isNearDeadline ? "destructive" : "default"}
        >
          {internship.current_applications >= internship.max_applications 
            ? "Vacantes completas" 
            : "Postularme"
          }
        </Button>
      </CardFooter>
    </Card>
  );
}