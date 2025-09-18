
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { cleanupExpiredStories } from "./utils/story-utils";

export function StoryCleanupManager() {
  useEffect(() => {
    // Ejecutar limpieza inmediata al cargar
    const runInitialCleanup = async () => {
      try {
        const count = await cleanupExpiredStories();
        if (count > 0) {
          console.log(`Se eliminaron ${count} historias caducadas al iniciar`);
        }
      } catch (error) {
        console.error("Error en limpieza inicial de historias:", error);
      }
    };

    runInitialCleanup();
    
    // Configurar limpieza periódica cada 30 minutos
    const cleanupInterval = setInterval(async () => {
      try {
        const count = await cleanupExpiredStories();
        if (count > 0) {
          console.log(`Se eliminaron ${count} historias caducadas (limpieza periódica)`);
        }
      } catch (error) {
        console.error("Error en limpieza periódica de historias:", error);
      }
    }, 30 * 60 * 1000); // 30 minutos

    // Configurar listener para cambios en tiempo real de historias
    const storyChannel = supabase
      .channel('story-cleanup')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'stories'
      }, async (payload) => {
        console.log('Cambio detectado en historias:', payload);
        // Ejecutar limpieza cuando hay cambios
        try {
          const count = await cleanupExpiredStories();
          if (count > 0) {
            console.log(`Se eliminaron ${count} historias caducadas (por cambio detectado)`);
          }
        } catch (error) {
          console.error("Error en limpieza por cambio detectado:", error);
        }
      })
      .subscribe();
    
    return () => {
      clearInterval(cleanupInterval);
      supabase.removeChannel(storyChannel);
    };
  }, []);

  return null; // Este componente no renderiza nada
}
