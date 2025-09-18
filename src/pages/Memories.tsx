import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, Heart, Image } from "lucide-react";

export default function Memories() {
  return (
    <FullScreenPageLayout title="Recuerdos">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <Clock className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-semibold mb-2">Tus Recuerdos</h2>
          <p className="text-muted-foreground">
            Revive tus momentos especiales y publicaciones pasadas
          </p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Recuerdos de hoy</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                No tienes recuerdos para el día de hoy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Image className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Esta semana hace un año</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                No hay recuerdos disponibles para esta fecha
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-medium mb-2">Próximamente</h3>
              <p className="text-sm text-muted-foreground">
                Estamos trabajando en traerte tus mejores recuerdos y momentos especiales
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </FullScreenPageLayout>
  );
}