
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { uploadToR2 } from "@/lib/storage/cloudflare-r2";

// Define StoryVisibility type properly with string literal union
export type StoryVisibility = 'public' | 'friends' | 'select' | 'except';

/**
 * Uploads a story to Supabase
 */
export async function uploadStory(
  file: File, 
  userId: string, 
  visibility: StoryVisibility
): Promise<string | null> {
  try {
    // Determine media type
    const isVideo = file.type.startsWith('video/');
    
    // 1. Upload the file to storage using R2
    const fileName = `stories/${userId}/${Date.now()}-${file.name}`;
    const publicUrl = await uploadToR2(file, fileName);
    
    // 2. Create a story entry
    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const { error: storyError } = await supabase
      .from('stories')
      .insert({
        user_id: userId,
        image_url: publicUrl,
        expires_at: expiresAt.toISOString(),
        media_type: isVideo ? 'video' : 'image',
        visibility: visibility
      });
      
    if (storyError) throw storyError;
    
    return publicUrl;
  } catch (error) {
    console.error("Error uploading story:", error);
    return null;
  }
}

/**
 * Validates a story file
 */
export function validateStoryFile(file: File): boolean {
  const fileSize = 15 * 1024 * 1024; // 15MB limit
  
  if (file.size > fileSize) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "El archivo es demasiado grande. Máximo 15MB.",
    });
    return false;
  }

  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Solo se permiten imágenes y videos para las historias.",
    });
    return false;
  }

  // Additional video validation
  if (file.type.startsWith("video/")) {
    // Max video duration would require client-side check with video element
    // For now, just check file type
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedVideoTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Formato de video no soportado. Utiliza MP4, WebM u OGG.",
      });
      return false;
    }
  }

  return true;
}

/**
 * Elimina las historias expiradas de forma más robusta
 */
export async function cleanupExpiredStories(): Promise<number> {
  try {
    const now = new Date();
    const currentTime = now.toISOString();
    
    console.log('Iniciando limpieza de historias expiradas...');
    console.log('Tiempo actual:', currentTime);
    
    // Primero, obtener las historias que han expirado
    const { data: expiredStories, error: selectError } = await supabase
      .from('stories')
      .select('id, expires_at, user_id, image_url')
      .lt('expires_at', currentTime);
    
    if (selectError) {
      console.error("Error al obtener historias expiradas:", selectError);
      throw selectError;
    }
    
    if (!expiredStories || expiredStories.length === 0) {
      console.log('No hay historias expiradas para eliminar');
      return 0;
    }
    
    console.log(`Encontradas ${expiredStories.length} historias expiradas:`, expiredStories);
    
    // Eliminar las historias expiradas una por una para mejor control
    let deletedCount = 0;
    for (const story of expiredStories) {
      try {
        // Eliminar views relacionadas primero
        await supabase
          .from('story_views')
          .delete()
          .eq('story_id', story.id);
          
        // Eliminar reacciones relacionadas
        await supabase
          .from('story_reactions')
          .delete()
          .eq('story_id', story.id);
        
        // Eliminar la historia
        const { error: deleteError } = await supabase
          .from('stories')
          .delete()
          .eq('id', story.id);
          
        if (deleteError) {
          console.error(`Error al eliminar historia ${story.id}:`, deleteError);
        } else {
          console.log(`Historia eliminada exitosamente: ${story.id}`);
          deletedCount++;
        }
      } catch (error) {
        console.error(`Error procesando historia ${story.id}:`, error);
      }
    }
    
    console.log(`Limpieza completada. ${deletedCount} historias eliminadas de ${expiredStories.length} encontradas.`);
    return deletedCount;
  } catch (error) {
    console.error("Error general en limpieza de historias:", error);
    return 0;
  }
}

/**
 * Función para forzar limpieza manual (útil para debugging)
 */
export async function forceCleanupExpiredStories(): Promise<number> {
  console.log('Ejecutando limpieza forzada de historias...');
  return await cleanupExpiredStories();
}

/**
 * Obtiene la configuración de privacidad de historias del usuario
 */
export async function getUserStoryPrivacySetting(userId: string): Promise<StoryVisibility> {
  try {
    // Use casting to bypass type checking for RPC call
    const rpcCall = supabase.rpc as any;
    const { data, error } = await rpcCall('get_user_story_privacy', { 
      user_id_input: userId 
    });
      
    if (error) {
      console.error("Error obteniendo configuración de privacidad:", error);
      return 'public';
    }
    
    // Check if data is a valid StoryVisibility value
    if (typeof data === 'string' && 
        (data === 'public' || data === 'friends' || data === 'select' || data === 'except')) {
      return data as StoryVisibility;
    }
    
    // Default fallback
    return 'public';
  } catch (error) {
    console.error("Error obteniendo configuración de privacidad:", error);
    return 'public';
  }
}

/**
 * Guarda la configuración de privacidad de historias del usuario
 */
export async function saveUserStoryPrivacySetting(
  userId: string, 
  privacySetting: StoryVisibility
): Promise<boolean> {
  try {
    // Use casting to bypass type checking for RPC call
    const rpcCall = supabase.rpc as any;
    const { error } = await rpcCall('save_user_story_privacy', {
      user_id_input: userId,
      privacy_setting: privacySetting
    });
      
    if (error) {
      console.error("Error guardando configuración de privacidad:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error guardando configuración de privacidad:", error);
    return false;
  }
}
