import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Briefcase, Users, Calendar, GraduationCap, Lightbulb } from "lucide-react";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { MentorshipForm } from "./forms/MentorshipForm";
import { InternshipForm } from "./forms/InternshipForm";
import { EventForm } from "./forms/EventForm";
import { JobForm } from "./forms/JobForm";
import { PostCreator } from "@/components/PostCreator";

interface CreateOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultType?: string;
}

type OpportunityType = "mentorship" | "internship" | "event" | "job" | "idea";

export function CreateOpportunityDialog({ open, onOpenChange, onSuccess, defaultType }: CreateOpportunityDialogProps) {
  const [opportunityType, setOpportunityType] = useState<OpportunityType | null>(defaultType as OpportunityType || null);
  const { shouldUseMobileLayout, isSmallScreen } = useMobileDetection();
  
  // Update opportunityType when defaultType changes
  useEffect(() => {
    if (defaultType) {
      setOpportunityType(defaultType as OpportunityType);
    }
  }, [defaultType]);

  const handleClose = () => {
    setOpportunityType(null);
    onOpenChange(false);
  };

  const handleSuccess = () => {
    onSuccess();
    handleClose();
  };

  const renderForm = () => {
    switch (opportunityType) {
      case "mentorship":
        return <MentorshipForm onClose={handleClose} onSuccess={handleSuccess} />;
      case "internship":
        return <InternshipForm onClose={handleClose} onSuccess={handleSuccess} />;
      case "event":
        return <EventForm onClose={handleClose} onSuccess={handleSuccess} />;
      case "job":
        return <JobForm onClose={handleClose} onSuccess={handleSuccess} />;
      case "idea":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Crear Idea Colaborativa</h3>
            </div>
            <PostCreator
              onPostCreated={handleSuccess}
              initialContent="💡 "
            />
          </div>
        );
      default:
        return null;
    }
  };

  const opportunityTypes = [
    {
      id: 'mentorship',
      title: 'Mentoría',
      description: 'Ofrece tus conocimientos y experiencia para guiar a otros estudiantes.',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      id: 'internship',
      title: 'Práctica Profesional',
      description: 'Publica oportunidades de prácticas profesionales en tu empresa.',
      icon: Briefcase,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      id: 'event',
      title: 'Evento Académico',
      description: 'Organiza conferencias, talleres, seminarios y más eventos educativos.',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      id: 'job',
      title: 'Empleo',
      description: 'Publica ofertas de trabajo para profesionales recién graduados.',
      icon: GraduationCap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100'
    },
    {
      id: 'idea',
      title: 'Idea Colaborativa',
      description: 'Comparte una idea de proyecto y encuentra colaboradores para hacerla realidad.',
      icon: Lightbulb,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`
        ${shouldUseMobileLayout 
          ? 'max-w-full max-h-[100vh] w-full h-full rounded-none m-0 p-0'
          : 'max-w-6xl max-h-[85vh] rounded-xl'
        } overflow-hidden border-0
      `}>
        <DialogHeader className={shouldUseMobileLayout ? "p-4 pb-2" : ""}>
          <div className="flex items-center gap-3">
            {opportunityType && shouldUseMobileLayout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpportunityType(null)}
                className="p-1 h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle className={shouldUseMobileLayout ? "text-lg" : ""}>
              {opportunityType 
                ? `Crear ${
                    opportunityType === "mentorship" ? "Mentoría" : 
                    opportunityType === "internship" ? "Práctica" :
                    opportunityType === "event" ? "Evento" :
                    opportunityType === "job" ? "Empleo" : "Idea"
                  }`
                : "Crear Oportunidad"
              }
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className={shouldUseMobileLayout ? "p-4 pt-2" : ""}>
          {!opportunityType ? (
            <div className="space-y-6">
              {/* Mobile: Stack selection, Desktop: Show select + cards */}
              {shouldUseMobileLayout ? (
                <div className="space-y-3">
                  {opportunityTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        variant="outline"
                        className={`w-full p-4 h-auto text-left justify-start ${type.bgColor} border-0 hover:shadow-md transition-all`}
                        onClick={() => setOpportunityType(type.id as OpportunityType)}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <Icon className={`h-6 w-6 ${type.color} mt-0.5 flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm mb-1">{type.title}</h3>
                            <p className="text-xs text-muted-foreground leading-tight">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="opportunity-type">Tipo de oportunidad</Label>
                    <Select onValueChange={(value) => setOpportunityType(value as OpportunityType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de oportunidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mentorship">Mentoría</SelectItem>
                        <SelectItem value="internship">Práctica Profesional</SelectItem>
                        <SelectItem value="event">Evento Académico</SelectItem>
                        <SelectItem value="job">Empleo</SelectItem>
                        <SelectItem value="idea">Idea Colaborativa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {opportunityTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <div key={type.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-5 w-5 ${type.color}`} />
                            <h3 className="font-medium">{type.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {type.description}
                          </p>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => setOpportunityType(type.id as OpportunityType)}
                          >
                            Crear {type.title}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            renderForm()
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}