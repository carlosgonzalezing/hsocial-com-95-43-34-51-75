import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateJobOfferFormProps {
  onSuccess: () => void;
}

export function CreateJobOfferForm({ onSuccess }: CreateJobOfferFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    company_name: "",
    position_title: "",
    description: "",
    job_type: "",
    location: "",
    remote_allowed: false,
    salary_min: "",
    salary_max: "",
    experience_level: "",
    industry: "",
    application_deadline: "",
    requirements: [] as string[],
    benefits: [] as string[]
  });

  const [currentRequirement, setCurrentRequirement] = useState("");
  const [currentBenefit, setCurrentBenefit] = useState("");

  const addRequirement = () => {
    if (currentRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, currentRequirement.trim()]
      }));
      setCurrentRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addBenefit = () => {
    if (currentBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, currentBenefit.trim()]
      }));
      setCurrentBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      if (!formData.position_title.trim()) {
        toast({
          title: "Error",
          description: "El título es requerido",
          variant: "destructive"
        });
        return;
      }

      if (!formData.company_name.trim()) {
        toast({
          title: "Error",
          description: "La empresa es requerida", 
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "¡Éxito!",
        description: "Oferta de trabajo creada exitosamente"
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error", 
        description: "No se pudo crear la oferta. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company_name">Nombre de la empresa *</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="position_title">Título del puesto *</Label>
          <Input
            id="position_title"
            value={formData.position_title}
            onChange={(e) => setFormData(prev => ({ ...prev, position_title: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción del puesto *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="job_type">Tipo de empleo *</Label>
          <Select value={formData.job_type} onValueChange={(value) => setFormData(prev => ({ ...prev, job_type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Tiempo completo</SelectItem>
              <SelectItem value="part_time">Medio tiempo</SelectItem>
              <SelectItem value="internship">Práctica</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
              <SelectItem value="contract">Contrato</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="experience_level">Nivel de experiencia</Label>
          <Select value={formData.experience_level} onValueChange={(value) => setFormData(prev => ({ ...prev, experience_level: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Sin experiencia</SelectItem>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="mid">Mid-level</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Ubicación *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="industry">Industria</Label>
          <Input
            id="industry"
            value={formData.industry}
            onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="remote_allowed"
          checked={formData.remote_allowed}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, remote_allowed: checked as boolean }))}
        />
        <Label htmlFor="remote_allowed">Trabajo remoto permitido</Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="salary_min">Salario mínimo (COP)</Label>
          <Input
            id="salary_min"
            type="number"
            value={formData.salary_min}
            onChange={(e) => setFormData(prev => ({ ...prev, salary_min: e.target.value }))}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="salary_max">Salario máximo (COP)</Label>
          <Input
            id="salary_max"
            type="number"
            value={formData.salary_max}
            onChange={(e) => setFormData(prev => ({ ...prev, salary_max: e.target.value }))}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="application_deadline">Fecha límite de aplicación</Label>
        <Input
          id="application_deadline"
          type="date"
          value={formData.application_deadline}
          onChange={(e) => setFormData(prev => ({ ...prev, application_deadline: e.target.value }))}
        />
      </div>

      {/* Requirements */}
      <div>
        <Label>Requisitos</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={currentRequirement}
            onChange={(e) => setCurrentRequirement(e.target.value)}
            placeholder="Añadir requisito"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
          />
          <Button type="button" onClick={addRequirement} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.requirements.map((req, index) => (
            <Badge key={index} variant="secondary" className="pr-1">
              {req}
              <button
                type="button"
                onClick={() => removeRequirement(index)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div>
        <Label>Beneficios</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={currentBenefit}
            onChange={(e) => setCurrentBenefit(e.target.value)}
            placeholder="Añadir beneficio"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
          />
          <Button type="button" onClick={addBenefit} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.benefits.map((benefit, index) => (
            <Badge key={index} variant="secondary" className="pr-1">
              {benefit}
              <button
                type="button"
                onClick={() => removeBenefit(index)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        Publicar Oferta Laboral
      </Button>
    </form>
  );
}