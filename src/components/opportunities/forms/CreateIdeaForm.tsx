import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NeededRole {
  title: string;
  description: string;
  commitment_level: string;
  skills_desired: string[];
}

interface CreateIdeaFormProps {
  onSuccess: () => void;
}

export function CreateIdeaForm({ onSuccess }: CreateIdeaFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    project_phase: "",
    estimated_duration: "",
    location_preference: "",
    expected_impact: "",
    collaboration_type: "",
    resources_needed: [] as string[]
  });

  const [neededRoles, setNeededRoles] = useState<NeededRole[]>([]);
  const [currentRole, setCurrentRole] = useState({
    title: "",
    description: "",
    commitment_level: "",
    skills_desired: [] as string[]
  });
  const [currentResource, setCurrentResource] = useState("");
  const [currentSkill, setCurrentSkill] = useState("");

  const addResource = () => {
    if (currentResource.trim()) {
      setFormData(prev => ({
        ...prev,
        resources_needed: [...prev.resources_needed, currentResource.trim()]
      }));
      setCurrentResource("");
    }
  };

  const removeResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources_needed: prev.resources_needed.filter((_, i) => i !== index)
    }));
  };

  const addSkillToRole = () => {
    if (currentSkill.trim()) {
      setCurrentRole(prev => ({
        ...prev,
        skills_desired: [...prev.skills_desired, currentSkill.trim()]
      }));
      setCurrentSkill("");
    }
  };

  const removeSkillFromRole = (index: number) => {
    setCurrentRole(prev => ({
      ...prev,
      skills_desired: prev.skills_desired.filter((_, i) => i !== index)
    }));
  };

  const addRole = () => {
    if (currentRole.title && currentRole.description && currentRole.commitment_level) {
      setNeededRoles(prev => [...prev, currentRole]);
      setCurrentRole({
        title: "",
        description: "",
        commitment_level: "",
        skills_desired: []
      });
    }
  };

  const removeRole = (index: number) => {
    setNeededRoles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const ideaData = {
        ...formData,
        needed_roles: neededRoles
      };

      // Validate form data
      if (!ideaData.title.trim()) {
        toast({
          title: "Error",
          description: "El título es requerido",
          variant: "destructive"
        });
        return;
      }

      if (!ideaData.description.trim()) {
        toast({
          title: "Error", 
          description: "La descripción es requerida",
          variant: "destructive"
        });
        return;
      }

      // Call onSuccess at the end
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la idea. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">Título de la idea *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción de la idea *</Label>
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
          <Label htmlFor="category">Categoría</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="ej. Tecnología, Educación, Salud"
          />
        </div>
        <div>
          <Label htmlFor="project_phase">Fase del proyecto</Label>
          <Select value={formData.project_phase} onValueChange={(value) => setFormData(prev => ({ ...prev, project_phase: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona la fase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ideation">Ideación</SelectItem>
              <SelectItem value="planning">Planeación</SelectItem>
              <SelectItem value="execution">Ejecución</SelectItem>
              <SelectItem value="launch">Lanzamiento</SelectItem>
              <SelectItem value="scaling">Escalamiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="estimated_duration">Duración estimada</Label>
          <Input
            id="estimated_duration"
            value={formData.estimated_duration}
            onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
            placeholder="ej. 3 meses, 6 semanas"
          />
        </div>
        <div>
          <Label htmlFor="location_preference">Ubicación preferida</Label>
          <Input
            id="location_preference"
            value={formData.location_preference}
            onChange={(e) => setFormData(prev => ({ ...prev, location_preference: e.target.value }))}
            placeholder="ej. Remoto, Bogotá, Híbrido"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="collaboration_type">Tipo de colaboración</Label>
        <Input
          id="collaboration_type"
          value={formData.collaboration_type}
          onChange={(e) => setFormData(prev => ({ ...prev, collaboration_type: e.target.value }))}
          placeholder="ej. Voluntario, Remunerado, Equity"
        />
      </div>

      <div>
        <Label htmlFor="expected_impact">Impacto esperado</Label>
        <Textarea
          id="expected_impact"
          value={formData.expected_impact}
          onChange={(e) => setFormData(prev => ({ ...prev, expected_impact: e.target.value }))}
          rows={3}
          placeholder="Describe el impacto que esperas tener con este proyecto"
        />
      </div>

      {/* Resources needed */}
      <div>
        <Label>Recursos necesarios</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={currentResource}
            onChange={(e) => setCurrentResource(e.target.value)}
            placeholder="Añadir recurso"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
          />
          <Button type="button" onClick={addResource} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.resources_needed.map((resource, index) => (
            <Badge key={index} variant="secondary" className="pr-1">
              {resource}
              <button
                type="button"
                onClick={() => removeResource(index)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Needed roles */}
      <div>
        <Label>Roles necesarios</Label>
        
        {/* Add new role */}
        <Card className="mt-2">
          <CardHeader>
            <CardTitle className="text-sm">Añadir nuevo rol</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Título del rol"
                value={currentRole.title}
                onChange={(e) => setCurrentRole(prev => ({ ...prev, title: e.target.value }))}
              />
              <Select value={currentRole.commitment_level} onValueChange={(value) => setCurrentRole(prev => ({ ...prev, commitment_level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Nivel de compromiso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Bajo</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Textarea
              placeholder="Descripción del rol"
              value={currentRole.description}
              onChange={(e) => setCurrentRole(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />

            <div>
              <Label className="text-sm">Habilidades deseadas</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  placeholder="Añadir habilidad"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillToRole())}
                />
                <Button type="button" onClick={addSkillToRole} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {currentRole.skills_desired.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs pr-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkillFromRole(index)}
                      className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <Button type="button" onClick={addRole} variant="outline" className="w-full">
              Añadir rol
            </Button>
          </CardContent>
        </Card>

        {/* Display added roles */}
        {neededRoles.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label className="text-sm">Roles añadidos:</Label>
            {neededRoles.map((role, index) => (
              <div key={index} className="border border-border rounded-lg p-3 bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{role.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{role.commitment_level}</Badge>
                    <button
                      type="button"
                      onClick={() => removeRole(index)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{role.description}</p>
                {role.skills_desired.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {role.skills_desired.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full">
        Publicar Idea Colaborativa
      </Button>
    </form>
  );
}