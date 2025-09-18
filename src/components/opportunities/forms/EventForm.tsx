import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAcademicEvent } from "@/lib/api/education";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mobileToasts } from "@/components/ui/mobile-toast";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { MobileFormWizard, MobileFormStep } from "../components";
import { EventFormSteps } from './EventFormSteps';

const agendaItemSchema = z.object({
  time: z.string().min(1, "Hora requerida"),
  title: z.string().min(1, "Título requerido"),
  speaker: z.string().min(1, "Ponente requerido"),
  description: z.string().min(1, "Descripción requerida")
});

const speakerSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  bio: z.string().min(1, "Biografía requerida"),
  photo: z.string().url("URL válida requerida"),
  linkedin: z.string().url("URL de LinkedIn válida").optional().or(z.literal(""))
});

const eventSchema = z.object({
  title: z.string().min(2, "Título del evento requerido"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  event_type: z.enum(["conference", "seminar", "workshop", "hackathon", "webinar", "networking", "career_fair"]),
  start_date: z.string().min(1, "Fecha de inicio requerida"),
  end_date: z.string().min(1, "Fecha de fin requerida"),
  location: z.string().optional(),
  is_virtual: z.boolean(),
  meeting_link: z.string().url("URL válida requerida").optional().or(z.literal("")),
  max_attendees: z.number().min(1).optional(),
  registration_required: z.boolean(),
  registration_deadline: z.string().optional(),
  is_free: z.boolean(),
  ticket_price: z.number().min(0),
  organizer_name: z.string().min(1, "Nombre del organizador requerido"),
  organizer_contact: z.string().email("Email válido requerido"),
  agenda: z.array(agendaItemSchema),
  speakers: z.array(speakerSchema),
  target_audience: z.array(z.string()),
  certificates_available: z.boolean()
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const EVENT_TYPES = [
  { value: "conference", label: "Conferencia" },
  { value: "seminar", label: "Seminario" },
  { value: "workshop", label: "Taller" },
  { value: "hackathon", label: "Hackathon" },
  { value: "webinar", label: "Webinar" },
  { value: "networking", label: "Networking" },
  { value: "career_fair", label: "Feria de empleo" }
];

const TARGET_AUDIENCES = [
  "Estudiantes", "Profesionales", "Emprendedores", "Desarrolladores",
  "Diseñadores", "Ingenieros", "Administradores", "Todos"
];

export function EventForm({ onClose, onSuccess }: EventFormProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const { shouldUseMobileLayout } = useMobileDetection();

  const totalSteps = 4;
  const stepTitles = [
    "Información Básica",
    "Fecha y Ubicación",
    "Audiencia y Detalles",
    "Agenda"
  ];

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      event_type: "seminar",
      start_date: "",
      end_date: "",
      location: "",
      is_virtual: false,
      meeting_link: "",
      max_attendees: 100,
      registration_required: true,
      registration_deadline: "",
      is_free: true,
      ticket_price: 0,
      organizer_name: "",
      organizer_contact: "",
      agenda: [],
      speakers: [],
      target_audience: [],
      certificates_available: false
    }
  });

  const { fields: agendaFields, append: appendAgenda, remove: removeAgenda } = useFieldArray({
    control: form.control,
    name: "agenda"
  });

  const { fields: speakerFields, append: appendSpeaker, remove: removeSpeaker } = useFieldArray({
    control: form.control,
    name: "speakers"
  });

  const isVirtual = form.watch("is_virtual");
  const isFree = form.watch("is_free");
  const registrationRequired = form.watch("registration_required");

  const onSubmit = async (data: EventFormData) => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create post first
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          content: `${data.title}\n\n${data.description}`,
          post_type: 'opportunity',
          visibility: 'public',
          user_id: user.id
        })
        .select()
        .single();

      if (postError) throw postError;

      // Create event record with proper types
      await createAcademicEvent({
        ...data,
        agenda: data.agenda as any,
        speakers: data.speakers as any
      }, post.id);

      if (shouldUseMobileLayout) {
        mobileToasts.success("Evento creado exitosamente");
      } else {
        toast({
          title: "Evento creado",
          description: "Tu evento académico ha sido publicado exitosamente"
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      if (shouldUseMobileLayout) {
        mobileToasts.error("No se pudo crear el evento");
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el evento",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    form.handleSubmit(onSubmit)();
  };

  const isStepValid = (): boolean => {
    const values = form.getValues();
    switch (currentStep) {
      case 1:
        return Boolean(
          values.title?.trim() && 
          values.description?.trim() && 
          values.event_type
        );
      case 2:
        return Boolean(
          values.start_date && 
          values.end_date &&
          (values.is_virtual || values.location?.trim())
        );
      case 3:
        return Boolean(
          values.organizer_name?.trim() && 
          values.organizer_contact?.trim()
        );
      case 4:
        return true; // Agenda is optional
      default:
        return false;
    }
  };

  const renderStep = () => {
    return (
      <EventFormSteps 
        form={form}
        agendaFields={{ fields: agendaFields, append: appendAgenda, remove: removeAgenda }}
        currentStep={currentStep}
        isVirtual={isVirtual}
        isFree={isFree}
        registrationRequired={registrationRequired}
      />
    );
  };

  return (
    <Form {...form}>
      <MobileFormWizard
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onCancel={onClose}
        onSubmit={handleSubmit}
        isSubmitting={loading}
        isNextEnabled={isStepValid()}
        isLastStep={currentStep === totalSteps}
        stepTitles={stepTitles}
      >
        {renderStep()}
      </MobileFormWizard>
    </Form>
  );
}