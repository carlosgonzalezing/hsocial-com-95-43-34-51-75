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

interface CreateProjectShowcaseFormProps {
  onSuccess: () => void;
}

export function CreateProjectShowcaseForm({ onSuccess }: CreateProjectShowcaseFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    project_title: "",
    project_description: "",
    project_status: "",
    industry: "",
    project_url: "",
    github_url: "",
    demo_url: "",
    team_size: "",
    duration_months: "",
    technologies_used: [] as string[],
    achievements: [] as string[],
    seeking_investment: false,
    seeking_collaborators: false,
    funding_needed: "",
    revenue_generated: "",
    user_base: "",
    business_model: ""
  });

  const [currentTechnology, setCurrentTechnology] = useState("");
  const [currentAchievement, setCurrentAchievement] = useState("");

  const addTechnology = () => {
    if (currentTechnology.trim()) {
      setFormData(prev => ({
        ...prev,
        technologies_used: [...prev.technologies_used, currentTechnology.trim()]
      }));
      setCurrentTechnology("");
    }
  };

  const removeTechnology = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies_used: prev.technologies_used.filter((_, i) => i !== index)
    }));
  };

  const addAchievement = () => {
    if (currentAchievement.trim()) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, currentAchievement.trim()]
      }));
      setCurrentAchievement("");
    }
  };

  const removeAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      if (!formData.project_title.trim()) {
        toast({
          title: "Error",
          description: "El título es requerido",
          variant: "destructive"
        });
        return;
      }

      if (!formData.project_description.trim()) {
        toast({
          title: "Error",
          description: "La descripción es requerida",
          variant: "destructive"
        });
        return;
      }

      if (!formData.technologies_used.length) {
        toast({
          title: "Error",
          description: "Agrega al menos una tecnología",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "¡Éxito!",
        description: "Proyecto creado exitosamente"
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el proyecto. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="project_title">Título del proyecto *</Label>
        <Input
          id="project_title"
          value={formData.project_title}
          onChange={(e) => setFormData(prev => ({ ...prev, project_title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="project_description">Descripción del proyecto *</Label>
        <Textarea
          id="project_description"
          value={formData.project_description}
          onChange={(e) => setFormData(prev => ({ ...prev, project_description: e.target.value }))}
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="project_status">Estado del proyecto *</Label>
          <Select value={formData.project_status} onValueChange={(value) => setFormData(prev => ({ ...prev, project_status: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="ongoing">En desarrollo</SelectItem>
              <SelectItem value="planning">En planeación</SelectItem>
              <SelectItem value="seeking_team">Buscando equipo</SelectItem>
            </SelectContent>
          </Select>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="project_url">URL del proyecto</Label>
          <Input
            id="project_url"
            type="url"
            value={formData.project_url}
            onChange={(e) => setFormData(prev => ({ ...prev, project_url: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="github_url">URL de GitHub</Label>
          <Input
            id="github_url"
            type="url"
            value={formData.github_url}
            onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="demo_url">URL del demo</Label>
          <Input
            id="demo_url"
            type="url"
            value={formData.demo_url}
            onChange={(e) => setFormData(prev => ({ ...prev, demo_url: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="team_size">Tamaño del equipo</Label>
          <Input
            id="team_size"
            type="number"
            value={formData.team_size}
            onChange={(e) => setFormData(prev => ({ ...prev, team_size: e.target.value }))}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="duration_months">Duración (meses)</Label>
          <Input
            id="duration_months"
            type="number"
            value={formData.duration_months}
            onChange={(e) => setFormData(prev => ({ ...prev, duration_months: e.target.value }))}
            placeholder="0"
          />
        </div>
      </div>

      {/* Technologies */}
      <div>
        <Label>Tecnologías utilizadas</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={currentTechnology}
            onChange={(e) => setCurrentTechnology(e.target.value)}
            placeholder="Añadir tecnología"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
          />
          <Button type="button" onClick={addTechnology} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.technologies_used.map((tech, index) => (
            <Badge key={index} variant="secondary" className="pr-1">
              {tech}
              <button
                type="button"
                onClick={() => removeTechnology(index)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <Label>Logros</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={currentAchievement}
            onChange={(e) => setCurrentAchievement(e.target.value)}
            placeholder="Añadir logro"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
          />
          <Button type="button" onClick={addAchievement} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.achievements.map((achievement, index) => (
            <Badge key={index} variant="secondary" className="pr-1">
              {achievement}
              <button
                type="button"
                onClick={() => removeAchievement(index)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Investment and collaboration */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="seeking_investment"
            checked={formData.seeking_investment}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, seeking_investment: checked as boolean }))}
          />
          <Label htmlFor="seeking_investment">Buscando inversión</Label>
        </div>

        {formData.seeking_investment && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="funding_needed">Financiación necesaria (COP)</Label>
              <Input
                id="funding_needed"
                type="number"
                value={formData.funding_needed}
                onChange={(e) => setFormData(prev => ({ ...prev, funding_needed: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="business_model">Modelo de negocio</Label>
              <Input
                id="business_model"
                value={formData.business_model}
                onChange={(e) => setFormData(prev => ({ ...prev, business_model: e.target.value }))}
              />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="seeking_collaborators"
            checked={formData.seeking_collaborators}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, seeking_collaborators: checked as boolean }))}
          />
          <Label htmlFor="seeking_collaborators">Buscando colaboradores</Label>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="revenue_generated">Ingresos generados (COP)</Label>
          <Input
            id="revenue_generated"
            type="number"
            value={formData.revenue_generated}
            onChange={(e) => setFormData(prev => ({ ...prev, revenue_generated: e.target.value }))}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="user_base">Base de usuarios</Label>
          <Input
            id="user_base"
            type="number"
            value={formData.user_base}
            onChange={(e) => setFormData(prev => ({ ...prev, user_base: e.target.value }))}
            placeholder="0"
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Publicar Proyecto
      </Button>
    </form>
  );
}