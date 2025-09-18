
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionManager } from "@/hooks/use-subscription-manager";

const notificationSound = new Audio("/notification.mp3");

export const useMessageNotifications = (currentUserId: string | null) => {
  const { toast } = useToast();
  const { getOrCreateChannel, removeChannel } = useSubscriptionManager();

  useEffect(() => {
    if (!currentUserId) return;

    const channelName = `messages-${currentUserId}`;
    
    const subscriptionPromise = getOrCreateChannel(channelName, (channel) => {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`
        },
        async (payload) => {
          try {
            // Reproducir sonido de notificación
            notificationSound.play().catch(() => {});
            
            // Obtener información del remitente para mostrar en la notificación
            const { data: senderData } = await (supabase as any)
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', payload.new.sender_id)
              .single();
            
            if (senderData && 'username' in senderData) {
              // Mostrar notificación toast con información del remitente
              toast({
                title: `Nuevo mensaje de ${senderData.username}`,
                description: payload.new.content.length > 30 
                  ? payload.new.content.substring(0, 30) + "..." 
                  : payload.new.content,
                duration: 2000,
              });
              
              // Crear notificación en la base de datos
              await (supabase as any).from('notifications').insert({
                type: 'message',
                sender_id: payload.new.sender_id,
                receiver_id: currentUserId,
                message: "te envió un mensaje",
                read: false
              });
            }
          } catch (error) {
            // Silent error handling for notifications
          }
        }
      );
    });

    // Handle subscription errors silently
    subscriptionPromise?.catch(() => {});

    return () => {
      removeChannel(channelName);
    };
  }, [currentUserId, toast, getOrCreateChannel, removeChannel]);
};
