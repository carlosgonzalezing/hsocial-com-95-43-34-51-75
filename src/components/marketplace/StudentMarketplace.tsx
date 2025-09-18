import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { 
  BookOpen, 
  Code, 
  PenTool, 
  Calculator, 
  Globe, 
  Heart,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  Search,
  Filter
} from "lucide-react";

interface MarketplaceService {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  price_type: string;
  location_type: string;
  location?: string | null;
  skills: string[] | null;
  available_hours?: string | null;
  user_id: string;
  created_at: string;
  is_active: boolean;
  reviews_count: number | null;
  average_rating: number | null;
  updated_at: string;
  user: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    career: string | null;
    semester: string | null;
  };
}

const SERVICE_CATEGORIES = [
  { id: 'tutoring', name: 'Tutorías', icon: BookOpen },
  { id: 'programming', name: 'Programación', icon: Code },
  { id: 'design', name: 'Diseño', icon: PenTool },
  { id: 'math', name: 'Matemáticas', icon: Calculator },
  { id: 'languages', name: 'Idiomas', icon: Globe },
  { id: 'writing', name: 'Redacción', icon: PenTool },
  { id: 'other', name: 'Otros', icon: Star }
];

export function StudentMarketplace() {
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state for creating service
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    price_type: 'per_hour' as const,
    location_type: 'online' as const,
    location: '',
    skills: '',
    available_hours: ''
  });

  useEffect(() => {
    loadServices();
  }, [selectedCategory, searchQuery]);

  const loadServices = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('marketplace_services')
        .select(`
          *,
          profiles (
            id,
            username,
            avatar_url,
            career,
            semester
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery.trim()) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map((service: any) => ({
        ...service,
        user: service.profiles
      }));
      
      setServices(transformedData);
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los servicios"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para crear un servicio"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('marketplace_services')
        .insert({
          ...serviceForm,
          skills: serviceForm.skills.split(',').map(s => s.trim()).filter(Boolean),
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Servicio creado",
        description: "Tu servicio ha sido publicado exitosamente"
      });

      setShowCreateDialog(false);
      setServiceForm({
        title: '',
        description: '',
        category: '',
        price: 0,
        price_type: 'per_hour',
        location_type: 'online',
        location: '',
        skills: '',
        available_hours: ''
      });
      loadServices();
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el servicio"
      });
    }
  };

  const formatPrice = (price: number, type: string) => {
    const formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });

    switch (type) {
      case 'per_hour':
        return `${formatter.format(price)}/hora`;
      case 'fixed':
        return formatter.format(price);
      case 'negotiable':
        return 'Negociable';
      default:
        return formatter.format(price);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Estudiantil</h1>
          <p className="text-muted-foreground">
            Encuentra servicios de otros estudiantes o ofrece los tuyos
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Ofrecer Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear nuevo servicio</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Título del servicio
                  </label>
                  <Input
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({...serviceForm, title: e.target.value})}
                    placeholder="Ej: Tutorías de Cálculo I"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Categoría
                  </label>
                  <Select
                    value={serviceForm.category}
                    onValueChange={(value) => setServiceForm({...serviceForm, category: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Modalidad
                  </label>
                  <Select
                    value={serviceForm.location_type}
                    onValueChange={(value: any) => setServiceForm({...serviceForm, location_type: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">En línea</SelectItem>
                      <SelectItem value="in_person">Presencial</SelectItem>
                      <SelectItem value="both">Ambas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Precio
                  </label>
                  <Input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({...serviceForm, price: Number(e.target.value)})}
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tipo de precio
                  </label>
                  <Select
                    value={serviceForm.price_type}
                    onValueChange={(value: any) => setServiceForm({...serviceForm, price_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_hour">Por hora</SelectItem>
                      <SelectItem value="fixed">Precio fijo</SelectItem>
                      <SelectItem value="negotiable">Negociable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Descripción
                  </label>
                  <Textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                    placeholder="Describe tu servicio, experiencia y metodología..."
                    rows={3}
                    required
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Habilidades (separadas por comas)
                  </label>
                  <Input
                    value={serviceForm.skills}
                    onChange={(e) => setServiceForm({...serviceForm, skills: e.target.value})}
                    placeholder="Ej: Cálculo, Álgebra, Matemáticas básicas"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Crear Servicio
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar servicios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {SERVICE_CATEGORIES.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Services Grid */}
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron servicios</h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Sé el primero en ofrecer un servicio'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const category = SERVICE_CATEGORIES.find(c => c.id === service.category);
            const IconComponent = category?.icon || BookOpen;
            
            return (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <Badge variant="secondary" className="text-xs">
                        {category?.name || 'Otro'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">
                        {formatPrice(service.price, service.price_type)}
                      </div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Provider info */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {service.user.avatar_url ? (
                          <img 
                            src={service.user.avatar_url} 
                            alt={service.user.username || ''}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium">
                            {service.user.username?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {service.user.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {service.user.career} - {service.user.semester}
                        </p>
                      </div>
                    </div>
                    
                    {/* Skills */}
                    {service.skills && service.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {service.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {service.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{service.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Location and rating */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {service.location_type === 'online' && 'En línea'}
                          {service.location_type === 'in_person' && 'Presencial'}
                          {service.location_type === 'both' && 'Presencial/En línea'}
                        </span>
                      </div>
                      
                      {service.average_rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current text-yellow-500" />
                          <span>{service.average_rating.toFixed(1)}</span>
                          <span>({service.reviews_count || 0})</span>
                        </div>
                      )}
                    </div>
                    
                    <Button className="w-full" size="sm">
                      Contactar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}