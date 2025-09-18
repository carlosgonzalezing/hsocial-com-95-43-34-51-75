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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mobileToasts } from "@/components/ui/mobile-toast";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { MobileFormWizard, MobileFormStep } from "../components";

const jobSchema = z.object({
  company_name: z.string().min(2, "Nombre de empresa requerido"),
  position_title: z.string().min(2, "Título del cargo requerido"),
  job_type: z.enum(["full_time", "part_time", "contract", "internship", "freelance"]),
  location: z.string().min(2, "Ubicación requerida"),
  remote_allowed: z.boolean(),
  experience_level: z.enum(["entry", "mid", "senior", "lead"]),
  salary_range: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().default("COP")
  }).optional(),
  requirements: z.array(z.string()).min(1, "Agrega al menos un requisito"),
  benefits: z.array(z.string()),
  application_deadline: z.string().optional(),
  company_size: z.enum(["startup", "small", "medium", "large"]).optional(),
  industry: z.string().optional(),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres")
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const JOB_TYPES = [
  { value: "full_time", label: "Tiempo completo" },
  { value: "part_time", label: "Medio tiempo" },
  { value: "contract", label: "Contrato" },
  { value: "internship", label: "Práctica" },
  { value: "freelance", label: "Freelance" }
];

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Junior" },
  { value: "mid", label: "Intermedio" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Líder/Gerente" }
];

const COMPANY_SIZES = [
  { value: "startup", label: "Startup (1-10)" },
  { value: "small", label: "Pequeña (11-50)" },
  { value: "medium", label: "Mediana (51-200)" },
  { value: "large", label: "Grande (200+)" }
];

const COMMON_BENEFITS = [
  "Seguro médico", "Vacaciones pagadas", "Trabajo remoto",
  "Horario flexible", "Capacitación", "Bonos de desempeño",
  "Gimnasio", "Almuerzo", "Transporte", "Días de cumpleaños"
];

export function JobForm({ onClose, onSuccess }: JobFormProps) {
  const [loading, setLoading] = useState(false);
  const [newRequirement, setNewRequirement] = useState("");
  const { toast } = useToast();

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      company_name: "",
      position_title: "",
      job_type: "full_time",
      location: "",
      remote_allowed: false,
      experience_level: "entry",
      salary_range: {
        min: 0,
        max: 0,
        currency: "COP"
      },
      requirements: [],
      benefits: [],
      application_deadline: "",
      company_size: "small",
      industry: "",
      description: ""
    }
  });

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

  const onSubmit = async (data: JobFormData) => {
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

      // Create job offer record
      const { error: jobError } = await supabase
        .from('job_offers')
        .insert({
          post_id: post.id,
          company_name: data.company_name,
          position_title: data.position_title,
          job_type: data.job_type,
          location: data.location,
          remote_allowed: data.remote_allowed,
          experience_level: data.experience_level,
          salary_range: data.salary_range,
          requirements: data.requirements,
          benefits: data.benefits,
          application_deadline: data.application_deadline || null,
          company_size: data.company_size,
          industry: data.industry
        });

      if (jobError) throw jobError;

      toast({
        title: "Empleo creado",
        description: "Tu oferta de empleo ha sido publicada exitosamente"
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la oferta de empleo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
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
                  <Input placeholder="Desarrollador Frontend, Product Manager..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción del cargo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe las responsabilidades, objetivos y perfil ideal..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="job_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de empleo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {JOB_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experience_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel de experiencia</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tamaño empresa</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COMPANY_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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

          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industria</FormLabel>
                <FormControl>
                  <Input placeholder="Tecnología, Finanzas, Salud..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="remote_allowed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Trabajo remoto permitido</FormLabel>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="salary_range.min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salario mínimo (COP)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="2000000"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salary_range.max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salario máximo (COP)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="4000000"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requisitos</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar requisito"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  />
                  <Button type="button" onClick={addRequirement}>Agregar</Button>
                </div>
                <div className="space-y-1">
                  {field.value.map((req, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
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
          name="benefits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beneficios</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {COMMON_BENEFITS.map((benefit) => (
                  <div key={benefit} className="flex items-center space-x-2">
                    <Checkbox
                      id={benefit}
                      checked={field.value.includes(benefit)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...field.value, benefit]);
                        } else {
                          field.onChange(field.value.filter((b) => b !== benefit));
                        }
                      }}
                    />
                    <Label htmlFor={benefit} className="text-sm">{benefit}</Label>
                  </div>
                ))}
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="application_deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha límite de aplicación (opcional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Publicando..." : "Publicar Empleo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}