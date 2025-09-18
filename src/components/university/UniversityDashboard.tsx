import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversityStats } from './UniversityStats';
import { UniversityConnectionCard } from './UniversityConnectionCard';
import { useUniversitySuggestions } from '@/hooks/use-university-suggestions';
import { useFriendActions } from '@/hooks/use-friends/use-friend-actions';
import { Building, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export function UniversityDashboard() {
  const user = useUser();
  const [userInstitution, setUserInstitution] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { suggestions, loading: suggestionsLoading, refetch } = useUniversitySuggestions(user?.id || null);
  const { followUser } = useFriendActions(user?.id || null, refetch);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('institution_name')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserInstitution(data?.institution_name || null);
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  const handleConnect = async (targetUserId: string) => {
    try {
      await followUser(targetUserId);
      toast.success('Solicitud de conexión enviada');
    } catch (error) {
      toast.error('Error al enviar solicitud de conexión');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!userInstitution) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Completa tu perfil</h3>
            <p className="text-muted-foreground">
              Agrega tu institución educativa para ver el dashboard universitario y conectar con compañeros.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const universitySuggestions = suggestions.filter(s => 
    s.institution_name === userInstitution
  );
  
  const crossUniversitySuggestions = suggestions.filter(s => 
    s.institution_name !== userInstitution
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Building className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Dashboard Universitario</h1>
          <p className="text-muted-foreground">{userInstitution}</p>
        </div>
      </div>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="connections">Conexiones</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6">
          <UniversityStats institutionName={userInstitution} />
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          {/* Universidad actual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Compañeros de {userInstitution}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {universitySuggestions.map((suggestion) => (
                  <UniversityConnectionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onConnect={handleConnect}
                    loading={suggestionsLoading}
                  />
                ))}
                {universitySuggestions.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No hay sugerencias disponibles de tu universidad
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Otras universidades */}
          {crossUniversitySuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Conexiones Inter-universitarias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {crossUniversitySuggestions.map((suggestion) => (
                    <UniversityConnectionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onConnect={handleConnect}
                      loading={suggestionsLoading}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Próximamente</h3>
              <p className="text-muted-foreground">
                Eventos inter-universitarios, hackathons y oportunidades de colaboración
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}