
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PopularUserProfile } from "@/types/database/follow.types";

export function usePopularUsers() {
  const [popularUsers, setPopularUsers] = useState<PopularUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [careerFilters, setCareerFilters] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPopularUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("🚀 Cargando usuarios populares con funciones optimizadas...");
        
        // Usar funciones optimizadas de base de datos en paralelo con timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: La consulta tardó demasiado')), 10000)
        );
        
        const [usersResult, careersResult] = await Promise.race([
          Promise.all([
            supabase.rpc('get_popular_users', { limit_count: 100 }),
            supabase.rpc('get_career_filters')
          ]) as Promise<[any, any]>,
          timeoutPromise
        ]) as [any, any];

        if (usersResult.error) {
          console.error('Error al obtener usuarios populares:', usersResult.error);
          const errorMsg = usersResult.error.message.includes('permission denied') 
            ? 'Sin permisos para acceder a los datos'
            : `Error al obtener usuarios: ${usersResult.error.message}`;
          setError(errorMsg);
          toast({
            title: "Error de datos",
            description: `No se pudieron cargar los usuarios: ${errorMsg}`,
            variant: "destructive"
          });
          return;
        }

        if (careersResult.error) {
          console.warn('Error al obtener filtros de carrera:', careersResult.error);
          // No bloqueamos por este error, solo usamos array vacío
        }

        const users = usersResult.data || [];
        const careers = careersResult.data?.map(row => row.career).filter(Boolean) || [];
        
        console.log(`✅ Cargados ${users.length} usuarios populares`);
        
        // Convertir tipos de bigint a number con validación
        const formattedUsers: PopularUserProfile[] = users.map(user => ({
          id: user.id,
          username: user.username || 'Usuario',
          avatar_url: user.avatar_url,
          career: user.career || 'Sin carrera',
          semester: user.semester || 'N/A',
          followers_count: Math.max(0, Number(user.followers_count) || 0),
          hearts_count: Math.max(0, Number(user.hearts_count) || 0),
        }));

        setPopularUsers(formattedUsers);
        setCareerFilters(careers);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error crítico al cargar usuarios populares:', error);
        
        if (errorMessage.includes('Timeout')) {
          setError('La carga está tardando más de lo esperado. Intenta de nuevo.');
          toast({
            title: "Conexión lenta",
            description: "La carga está tardando más de lo esperado. Por favor, intenta de nuevo.",
            variant: "destructive"
          });
        } else {
          setError(errorMessage);
          toast({
            title: "Error de sistema",
            description: "Ocurrió un problema inesperado. Por favor, inténtalo de nuevo.",
            variant: "destructive"
          });
        }
        
        setPopularUsers([]);
        setCareerFilters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularUsers();
  }, [toast]);

  return { 
    popularUsers, 
    loading, 
    error,
    careerFilters 
  };
}
