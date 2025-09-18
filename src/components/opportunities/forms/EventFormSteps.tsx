import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MobileFormStep } from "../components";
import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";

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

interface AgendaFieldsProps {
  fields: any[];
  append: (value: any) => void;
  remove: (index: number) => void;
}

interface EventFormStepsProps {
  form: UseFormReturn<any>;
  agendaFields: AgendaFieldsProps;
  currentStep: number;
  isVirtual: boolean;
  isFree: boolean;
  registrationRequired: boolean;
}

export function EventFormSteps({ 
  form, 
  agendaFields, 
  currentStep, 
  isVirtual, 
  isFree, 
  registrationRequired 
}: EventFormStepsProps) {
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <MobileFormStep 
            title="Información Básica"
            description="Detalles principales de tu evento académico."
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del evento</FormLabel>
                    <FormControl>
                      <Input placeholder="Conferencia de Tecnología 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="event_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de evento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EVENT_TYPES.map((type) => (
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el evento, objetivos y beneficios para los asistentes..."
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
            title="Fecha y Ubicación"
            description="¿Cuándo y dónde será tu evento?"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha y hora de inicio</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha y hora de fin</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center space-x-4">
                <FormField
                  control={form.control}
                  name="is_virtual"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value === true}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                      </FormControl>
                      <FormLabel>Evento virtual</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certificates_available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value === true}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                      </FormControl>
                      <FormLabel>Certificados</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {isVirtual ? (
                <FormField
                  control={form.control}
                  name="meeting_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enlace de la reunión</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://zoom.us/j/123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación</FormLabel>
                      <FormControl>
                        <Input placeholder="Auditorio Principal, Universidad ABC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </MobileFormStep>
        );

      case 3:
        return (
          <MobileFormStep 
            title="Detalles del Organizador"
            description="Información de contacto y audiencia objetivo."
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="organizer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizador</FormLabel>
                    <FormControl>
                      <Input placeholder="Universidad ABC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizer_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de contacto</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="eventos@universidad.edu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_audience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audiencia objetivo</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {TARGET_AUDIENCES.map((audience) => (
                        <div key={audience} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-muted/50 transition-colors">
                          <Checkbox
                            id={audience}
                            checked={field.value.includes(audience)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, audience]);
                              } else {
                                field.onChange(field.value.filter((a) => a !== audience));
                              }
                            }}
                          />
                          <Label htmlFor={audience} className="flex-1 text-xs cursor-pointer">
                            {audience}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </MobileFormStep>
        );

      case 4:
        return (
          <MobileFormStep 
            title="Agenda (Opcional)"
            description="Define las actividades de tu evento."
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Actividades del evento</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => agendaFields.append({ time: "", title: "", speaker: "", description: "" })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </Button>
              </div>

              {agendaFields.fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm">Actividad {index + 1}</h5>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => agendaFields.remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`agenda.${index}.time`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Hora</FormLabel>
                          <FormControl>
                            <Input placeholder="10:00 AM" className="text-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`agenda.${index}.speaker`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Ponente</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. Juan Pérez" className="text-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`agenda.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Introducción a la Inteligencia Artificial" className="text-sm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`agenda.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Descripción</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descripción de la actividad..." className="text-sm min-h-[60px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              {agendaFields.fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No hay actividades agregadas</p>
                  <p className="text-xs">Puedes saltar este paso si prefieres</p>
                </div>
              )}
            </div>
          </MobileFormStep>
        );

      default:
        return null;
    }
  };

  return renderStep();
}