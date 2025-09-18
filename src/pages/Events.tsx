import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { EventsList } from "@/components/events/EventsList";
import { UniversityEventsList } from "@/components/events/UniversityEventsList";
import { Calendar, MapPin, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function Events() {
  return (
    <FullScreenPageLayout title="Eventos">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Eventos</h1>
            <p className="text-muted-foreground">
              Descubre eventos universitarios y académicos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">Próximos Eventos</h3>
              <p className="text-sm text-muted-foreground">Esta semana</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium">Eventos Locales</h3>
              <p className="text-sm text-muted-foreground">En tu ciudad</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium">Networking</h3>
              <p className="text-sm text-muted-foreground">Conecta y aprende</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Todos los Eventos</TabsTrigger>
            <TabsTrigger value="universities">Por Universidad</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <EventsList />
          </TabsContent>
          
          <TabsContent value="universities" className="space-y-4">
            <UniversityEventsList />
          </TabsContent>
        </Tabs>
      </div>
    </FullScreenPageLayout>
  );
}