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
import { createInternship } from "@/lib/api/education";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mobileToasts } from "@/components/ui/mobile-toast";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { MobileFormWizard, MobileFormStep, UnifiedFormLayout, DesktopFormStep } from "../components";

const internshipSchema = z.object({
  company_name: z.string().min(2, "Nombre de empresa requerido"),
  position_title: z.string().min(2, "Título del cargo requerido"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  requirements: z.array(z.string()).min(1, "Agrega al menos un requisito"),
  duration_months: z.number().min(1).max(12).nullable(),
  is_paid: z.boolean(),
  stipend_amount: z.number().min(0),
  location: z.string().optional(),
  is_remote: z.boolean(),
  required_semester: z.string().optional(),
  required_careers: z.array(z.string()),
  skills_to_develop: z.array(z.string()),
  application_deadline: z.string().optional(),
  start_date: z.string().optional(),
  contact_email: z.string().email("Email válido requerido").optional(),
  contact_phone: z.string().optional(),
  max_applications: z.number().min(1).max(100)
});

type InternshipFormData = z.infer<typeof internshipSchema>;

interface InternshipFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CAREERS = [
  "Ingeniería de Sistemas", "Ingeniería Industrial", "Administración",
  "Marketing", "Diseño Gráfico", "Contaduría", "Derecho", "Psicología",
  "Comunicación Social", "Arquitectura"
];

const SKILLS = [
  "JavaScript", "Python", "React", "Node.js", "SQL", "Git",
  "Photoshop", "Illustrator", "Figma", "Excel", "PowerPoint",
  "Inglés", "Gestión de proyectos", "Análisis de datos"
];

export function InternshipForm({ onClose, onSuccess }: InternshipFormProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newRequirement, setNewRequirement] = useState("");
  const { toast } = useToast();
  const { shouldUseMobileLayout } = useMobileDetection();

  const totalSteps = 4;
  const stepTitles = [
    "Información Básica",
    "Requisitos",
    "Detalles y Beneficios",
    "Contacto"
  ];

  const form = useForm<InternshipFormData>({
    resolver: zodResolver(internshipSchema),
    defaultValues: {
      company_name: "",
      position_title: "",
      description: "",
      requirements: [],
      duration_months: 6,
      is_paid: false,
      stipend_amount: 0,
      location: "",
      is_remote: false,
      required_semester: "",
      required_careers: [],
      skills_to_develop: [],
      application_deadline: "",
      start_date: "",
      contact_email: "",
      contact_phone: "",
      max_applications: 20
    }
  });

  const isPaid = form.watch("is_paid");
  const isRemote = form.watch("is_remote");

  const addRequirement = () => {
    if (newRequirement.trim()) {
      const current = form.getValues("requirements");
      form.setValue("requirements", [...current, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    const current = form.getValues("requirements");
    form.setValue("requirements", current.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: InternshipFormData) => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create post first
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          content: `${data.company_name} - ${data.position_title}\n\n${data.description}`,
          post_type: 'opportunity',
          visibility: 'public',
          user_id: user.id
        })
        .select()
        .single();

      if (postError) throw postError;

      // Create internship record
      await createInternship(data, post.id);

      if (shouldUseMobileLayout) {
        mobileToasts.success("Práctica creada exitosamente");
      } else {
        toast({
          title: "Práctica creada",
          description: "Tu oferta de práctica ha sido publicada exitosamente"
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating internship:', error);
      if (shouldUseMobileLayout) {
        mobileToasts.error("No se pudo crear la práctica");
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear la práctica",
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
          values.company_name?.trim() && 
          values.position_title?.trim() && 
          values.description?.trim()
        );
      case 2:
        return Boolean(values.requirements && values.requirements.length > 0);
      case 3:
        return Boolean(values.duration_months && values.max_applications);
      case 4:
        return Boolean(values.contact_email?.trim());
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <MobileFormStep 
            title="Información Básica"
            description="Detalles principales de la práctica profesional."
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Desarrollador Junior, Asistente de Marketing..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe las responsabilidades y objetivos de la práctica..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </MobileFormStep>
        );

      case 2:
        return (
          <MobileFormStep 
            title="Requisitos"
            description="Define qué necesitas del candidato ideal."
          >
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requisitos del candidato</FormLabel>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ej: Conocimientos en React"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                      />
                      <Button type="button" onClick={addRequirement} size="sm">
                        Agregar
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {field.value.map((req, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                          <span className="text-sm">{req}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRequirement(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="required_careers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carreras requeridas (opcional)</FormLabel>
                  <div className="grid grid-cols-1 gap-2">
                    {CAREERS.map((career) => (
                      <div key={career} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id={career}
                          checked={field.value.includes(career)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, career]);
                            } else {
                              field.onChange(field.value.filter((c) => c !== career));
                            }
                          }}
                        />
                        <Label htmlFor={career} className="flex-1 text-sm cursor-pointer">
                          {career}
                        </Label>
                      </div>
                    ))}
                  </div>
                </FormItem>
              )}
            />
          </MobileFormStep>
        );

      case 3:
        return (
          <MobileFormStep 
            title="Detalles y Beneficios"
            description="Configuración de la práctica y lo que ofreces."
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración (meses)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[3, 4, 5, 6, 9, 12].map((months) => (
                            <SelectItem key={months} value={months.toString()}>{months} meses</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_applications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máx. aplicaciones</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center space-x-4">
                <FormField
                  control={form.control}
                  name="is_paid"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value === true}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                      </FormControl>
                      <FormLabel>Práctica remunerada</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_remote"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value === true}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                      </FormControl>
                      <FormLabel>Modalidad remota</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {isPaid && (
                <FormField
                  control={form.control}
                  name="stipend_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auxilio mensual (COP)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="800000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {!isRemote && (
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación</FormLabel>
                      <FormControl>
                        <Input placeholder="Bogotá, Medellín, Cali..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </MobileFormStep>
        );

      case 4:
        return (
          <MobileFormStep 
            title="Información de Contacto"
            description="¿Cómo pueden contactarte los interesados?"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de contacto</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="rh@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+57 300 123 4567" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
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
        title="Crear Práctica Profesional"
        description="Publica una oportunidad de práctica profesional para estudiantes."
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