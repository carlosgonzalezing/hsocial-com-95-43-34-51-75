
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Building2, CalendarDays, Heart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Profile } from "@/pages/Profile";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PremiumFineBanner } from "@/components/premium/PremiumFineBanner";

interface ProfileInfoProps {
  profile: Profile;
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
  const isMobile = useIsMobile();
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMMM yyyy", { locale: es });
    } catch (error) {
      return "Fecha desconocida";
    }
  };

  const getRelationshipStatusLabel = (status: string | null) => {
    if (!status) return null;
    
    const statusLabels: Record<string, string> = {
      'soltero': 'Soltero/a',
      'en_relacion': 'En una relación',
      'casado': 'Casado/a',
      'es_complicado': 'Es complicado',
      'divorciado': 'Divorciado/a',
      'viudo': 'Viudo/a'
    };
    
    return statusLabels[status] || status;
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Información</CardTitle>
      </CardHeader>
      <CardContent>
        <PremiumFineBanner userId={profile.id} />
        <div className={`space-y-4 profile-info-grid ${isMobile ? 'grid-cols-1' : 'grid grid-cols-1'}`}>
          {profile.bio && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Sobre mí</h3>
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
              <Separator className="my-2" />
            </div>
          )}
          
          {(profile.career || profile.semester) && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Educación</h3>
              </div>
              {profile.career && (
                <p className="text-sm text-muted-foreground pl-6">
                  Carrera: {profile.career}
                </p>
              )}
              {profile.semester && (
                <p className="text-sm text-muted-foreground pl-6">
                  Semestre: {profile.semester}
                </p>
              )}
              <Separator className="my-2" />
            </div>
          )}
          
          {profile.location && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Ubicación</h3>
              </div>
              <p className="text-sm text-muted-foreground pl-6">{profile.location}</p>
              <Separator className="my-2" />
            </div>
          )}
          
          {profile.relationship_status && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Situación sentimental</h3>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {getRelationshipStatusLabel(profile.relationship_status)}
              </p>
              <Separator className="my-2" />
            </div>
          )}
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Se unió</h3>
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              {formatDate(profile.created_at)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
