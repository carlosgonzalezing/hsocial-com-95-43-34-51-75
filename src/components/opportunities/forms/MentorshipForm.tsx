import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createMentorship } from "@/lib/api/education";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mobileToasts } from "@/components/ui/mobile-toast";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { MobileFormWizard, MobileFormStep } from "../components";
import { UnifiedFormLayout } from "../components/UnifiedFormLayout";
import { DesktopFormStep } from "../components/DesktopFormStep";

const mentorshipSchema = z.object({
  specialties: z.array(z.string()).min(1, "Selecciona al menos una especialidad"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  availability: z.object({
    days: z.array(z.string()).min(1, "Selecciona al menos un día"),
    hours: z.object({
      start: z.string().min(1, "Hora de inicio requerida"),
      end: z.string().min(1, "Hora de fin requerida")
    })
  }),
  is_free: z.boolean(),
  hourly_rate: z.number().min(0),
  max_students_per_session: z.number().min(1).max(10),
  session_duration: z.number().min(30).max(180)
});

type MentorshipFormData = z.infer<typeof mentorshipSchema>;

interface MentorshipFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SPECIALTIES = [
  "Programación", "Diseño", "Marketing", "Finanzas", "Emprendimiento",
  "Data Science", "Inteligencia Artificial", "Desarrollo Web", "Mobile",
  "UI/UX", "Product Management", "Ventas", "Recursos Humanos"
];

const DAYS = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
];

export function MentorshipForm({ onClose, onSuccess }: MentorshipFormProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const { shouldUseMobileLayout } = useMobileDetection();

  const totalSteps = 4;
  const stepTitles = [
    "Especialidades",
    "Descripción",
    "Disponibilidad", 
    "Precio y Detalles"
  ];

  const form = useForm<MentorshipFormData>({
    resolver: zodResolver(mentorshipSchema),
    defaultValues: {
      specialties: [],
      description: "",
      availability: {
        days: [],
        hours: {
          start: "09:00",
          end: "17:00"
        }
      },
      is_free: true,
      hourly_rate: 0,
      max_students_per_session: 1,
      session_duration: 60
    }
  });

  const isFree = form.watch("is_free");

  const onSubmit = async (data: MentorshipFormData) => {
    try {
      setLoading(true);

      // Create mentorship record with proper typing
      await createMentorship({
        specialties: data.specialties,
        description: data.description,
        availability: data.availability as any,
        is_free: data.is_free,
        hourly_rate: data.hourly_rate,
        max_students_per_session: data.max_students_per_session,
        session_duration: data.session_duration
      });

      if (shouldUseMobileLayout) {
        mobileToasts.success("Mentoría creada exitosamente");
      } else {
        toast({
          title: "Mentoría creada",
          description: "Tu mentoría ha sido publicada exitosamente"
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating mentorship:', error);
      if (shouldUseMobileLayout) {
        mobileToasts.error("No se pudo crear la mentoría");
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear la mentoría",
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
        return Boolean(values.specialties && values.specialties.length > 0);
      case 2:
        return Boolean(values.description && values.description.length >= 10);
      case 3:
        return Boolean(values.availability?.days?.length > 0 && 
               values.availability?.hours?.start && 
               values.availability?.hours?.end);
      case 4:
        return true; // Final step validation happens on submit
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <MobileFormStep 
            title="¿En qué especialidades puedes ofrecer mentoría?"
            description="Selecciona las áreas donde tienes experiencia y puedes guiar a otros estudiantes."
          >
            <FormField
              control={form.control}
              name="specialties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Especialidades</FormLabel>
                  <div className="grid grid-cols-1 gap-3">
                    {SPECIALTIES.map((specialty) => (
                      <div key={specialty} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id={specialty}
                          checked={field.value.includes(specialty)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, specialty]);
                            } else {
                              field.onChange(field.value.filter((s) => s !== specialty));
                            }
                          }}
                        />
                        <Label htmlFor={specialty} className="flex-1 text-sm font-medium cursor-pointer">
                          {specialty}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </MobileFormStep>
        );

      case 2:
        return (
          <MobileFormStep 
            title="Describe tu experiencia"
            description="Cuéntanos sobre tu background y qué puedes enseñar a otros estudiantes."
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Soy desarrollador senior con 5 años de experiencia en React y Node.js. He trabajado en startups y empresas grandes, y me especializo en arquitectura de aplicaciones web..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{field.value?.length || 0} caracteres</span>
                    <span>Mínimo 10 caracteres</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </MobileFormStep>
        );

      case 3:
        return (
          <MobileFormStep 
            title="¿Cuándo estás disponible?"
            description="Define los días y horarios en los que puedes ofrecer mentorías."
          >
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="availability.days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días disponibles</FormLabel>
                    <div className="grid grid-cols-1 gap-2">
                      {DAYS.map((day) => (
                        <div key={day} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <Checkbox
                            id={day}
                            checked={field.value.includes(day)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, day]);
                              } else {
                                field.onChange(field.value.filter((d) => d !== day));
                              }
                            }}
                          />
                          <Label htmlFor={day} className="flex-1 text-sm font-medium cursor-pointer">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="availability.hours.start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de inicio</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availability.hours.end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de fin</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </MobileFormStep>
        );

      case 4:
        return (
          <MobileFormStep 
            title="Detalles finales"
            description="Configura el precio y los detalles de tus sesiones de mentoría."
          >
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="is_free"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 border rounded-lg">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Mentoría gratuita
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Ofrecer mentoría sin costo ayuda a más estudiantes
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {!isFree && (
                <FormField
                  control={form.control}
                  name="hourly_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarifa por hora (COP)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="50000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="max_students_per_session"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estudiantes por sesión</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="session_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración (minutos)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="60">60 min</SelectItem>
                          <SelectItem value="90">90 min</SelectItem>
                          <SelectItem value="120">120 min</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </MobileFormStep>
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <UnifiedFormLayout
        title="Crear Mentoría"
        description="Comparte tu experiencia y ayuda a otros estudiantes a crecer profesionalmente."
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
      </UnifiedFormLayout>
    </Form>
  );
}