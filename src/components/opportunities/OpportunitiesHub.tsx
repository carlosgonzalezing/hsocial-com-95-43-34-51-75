import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Briefcase, Users, Lightbulb, MapPin, DollarSign, Clock, GraduationCap, Calendar, Award } from "lucide-react";
import { CreateOpportunityDialog } from "./CreateOpportunityDialog";
import { MentorshipCard } from "./mentorship/MentorshipCard";
import { InternshipCard } from "./internship/InternshipCard";
import { AcademicEventCard } from "./events/AcademicEventCard";
import { IdeaCard } from "./ideas/IdeaCard";
import { getMentorships, getInternships, getAcademicEvents, getIdeasFromPosts } from "@/lib/api/education";
import { Mentorship, Internship, AcademicEvent } from "@/types/education";
import { useToast } from "@/hooks/use-toast";

export function OpportunitiesHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [dialogDefaultType, setDialogDefaultType] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("all");
  
  // Data states
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [academicEvents, setAcademicEvents] = useState<AcademicEvent[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [mentorshipsData, internshipsData, eventsData, ideasData] = await Promise.all([
          getMentorships(),
          getInternships(),
          getAcademicEvents(),
          getIdeasFromPosts()
        ]);
        
        setMentorships(mentorshipsData);
        setInternships(internshipsData);
        setAcademicEvents(eventsData);
        setIdeas(ideasData);
      } catch (error) {
        console.error("Error loading opportunities:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las oportunidades",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const openCreateDialog = (type?: string) => {
    setDialogDefaultType(type);
    setShowCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
    setDialogDefaultType(undefined);
  };

  // Determine if main create button should be visible
  const shouldShowMainCreateButton = () => {
    if (activeTab === "all") return true;
    
    // Show if current tab has no content
    switch (activeTab) {
      case "mentorships":
        return mentorships.length === 0;
      case "internships":
        return internships.length === 0;
      case "events":
        return academicEvents.length === 0;
      case "jobs":
        return true; // Jobs tab always shows button since it's under development
      case "ideas":
        return ideas.length === 0;
      default:
        return true;
    }
  };

  const handleBookMentorship = (mentorshipId: string) => {
    toast({
      title: "Funcionalidad próximamente",
      description: "Pronto podrás agendar sesiones de mentoría"
    });
  };

  const handleApplyInternship = (internshipId: string) => {
    toast({
      title: "Funcionalidad próximamente", 
      description: "Pronto podrás postularte a prácticas profesionales"
    });
  };

  const handleRegisterEvent = (eventId: string) => {
    toast({
      title: "Funcionalidad próximamente",
      description: "Pronto podrás registrarte a eventos académicos"
    });
  };

  const handleJoinIdea = (ideaId: string) => {
    toast({
      title: "Funcionalidad próximamente",
      description: "Pronto podrás unirte a ideas colaborativas"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Desarrollo de Oportunidades</h1>
          <p className="text-muted-foreground mt-2">
            Descubre mentorías, prácticas profesionales, eventos académicos y más oportunidades de crecimiento
          </p>
        </div>
        {shouldShowMainCreateButton() && (
          <Button onClick={() => openCreateDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Oportunidad
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar oportunidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Industria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las industrias</SelectItem>
            <SelectItem value="tech">Tecnología</SelectItem>
            <SelectItem value="design">Diseño</SelectItem>
            <SelectItem value="business">Negocios</SelectItem>
            <SelectItem value="engineering">Ingeniería</SelectItem>
            <SelectItem value="health">Salud</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ubicación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las ubicaciones</SelectItem>
            <SelectItem value="remote">Remoto</SelectItem>
            <SelectItem value="bogota">Bogotá</SelectItem>
            <SelectItem value="medellin">Medellín</SelectItem>
            <SelectItem value="cali">Cali</SelectItem>
            <SelectItem value="barranquilla">Barranquilla</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentorías Disponibles</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mentorships.length}</div>
            <p className="text-xs text-muted-foreground">Especialistas disponibles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prácticas Profesionales</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{internships.length}</div>
            <p className="text-xs text-muted-foreground">Oportunidades activas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Académicos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicEvents.length}</div>
            <p className="text-xs text-muted-foreground">Próximos eventos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ideas Colaborativas</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ideas.length}</div>
            <p className="text-xs text-muted-foreground">Proyectos disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="mentorships">Mentorías</TabsTrigger>
          <TabsTrigger value="internships">Prácticas</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="jobs">Empleos</TabsTrigger>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mentorships */}
              {mentorships.slice(0, 2).map((mentorship) => (
                <MentorshipCard 
                  key={mentorship.id} 
                  mentorship={mentorship}
                  onBookSession={handleBookMentorship}
                />
              ))}
              
              {/* Internships */}
              {internships.slice(0, 2).map((internship) => (
                <InternshipCard 
                  key={internship.id} 
                  internship={internship}
                  onApply={handleApplyInternship}
                />
              ))}
              
              {/* Academic Events */}
              {academicEvents.slice(0, 2).map((event) => (
                <AcademicEventCard 
                  key={event.id} 
                  event={event}
                  onRegister={handleRegisterEvent}
                />
              ))}

              {/* Ideas */}
              {ideas.slice(0, 2).map((idea) => (
                <IdeaCard 
                  key={idea.id} 
                  idea={idea}
                  onJoin={handleJoinIdea}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mentorships" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : mentorships.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay mentorías disponibles</h3>
                <p className="text-muted-foreground text-center">
                  ¿Eres un profesional? Ofrece tu experiencia como mentor.
                </p>
                <Button className="mt-4" onClick={() => openCreateDialog("mentorship")}>
                  Crear Mentoría
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentorships.map((mentorship) => (
                <MentorshipCard 
                  key={mentorship.id} 
                  mentorship={mentorship}
                  onBookSession={handleBookMentorship}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="internships" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : internships.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay prácticas disponibles</h3>
                <p className="text-muted-foreground text-center">
                  ¿Representas una empresa? Publica oportunidades de prácticas profesionales.
                </p>
                <Button className="mt-4" onClick={() => openCreateDialog("internship")}>
                  Publicar Práctica
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.map((internship) => (
                <InternshipCard 
                  key={internship.id} 
                  internship={internship}
                  onApply={handleApplyInternship}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : academicEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay eventos programados</h3>
                <p className="text-muted-foreground text-center">
                  ¿Organizas eventos académicos? Compártelos con la comunidad.
                </p>
                <Button className="mt-4" onClick={() => openCreateDialog("event")}>
                  Crear Evento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {academicEvents.map((event) => (
                <AcademicEventCard 
                  key={event.id} 
                  event={event}
                  onRegister={handleRegisterEvent}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ofertas de Trabajo</h3>
              <p className="text-muted-foreground text-center mb-4">
                Las ofertas de trabajo regulares están en desarrollo. <br />
                Por ahora, explora las prácticas profesionales disponibles.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => openCreateDialog("job")}>
                  Crear Oferta de Empleo
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("internships")}>
                  Ver Prácticas Profesionales
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ideas" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : ideas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay ideas colaborativas</h3>
                <p className="text-muted-foreground text-center">
                  ¿Tienes una idea innovadora? Compártela y encuentra colaboradores.
                </p>
                <Button className="mt-4" onClick={() => openCreateDialog("idea")}>
                  Compartir una Idea
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea) => (
                <IdeaCard 
                  key={idea.id} 
                  idea={idea}
                  onJoin={handleJoinIdea}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateOpportunityDialog 
        open={showCreateDialog} 
        onOpenChange={handleCloseDialog} 
        defaultType={dialogDefaultType}
        onSuccess={() => {
          // Reload data when a new opportunity is created
          const loadData = async () => {
            try {
              const [mentorshipsData, internshipsData, eventsData, ideasData] = await Promise.all([
                getMentorships(),
                getInternships(),
                getAcademicEvents(),
                getIdeasFromPosts()
              ]);
              
              setMentorships(mentorshipsData);
              setInternships(internshipsData);
              setAcademicEvents(eventsData);
              setIdeas(ideasData);
            } catch (error) {
              console.error("Error reloading opportunities:", error);
            }
          };
          loadData();
        }}
      />
    </div>
  );
}
