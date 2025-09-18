
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GroupMessage {
  id: string;
  content: string;
  sender_id: string;
  type: 'text' | 'audio' | 'image';
  media_url: string | null;
  created_at: string;
  is_deleted: boolean;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
}

export function useGroupMessages(currentUserId: string | null, groupId: string | null, enabled: boolean) {
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled || !currentUserId || !groupId) return;

    const loadGroupMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('group_messages')
          .select(`
            *,
            sender:profiles!group_messages_sender_id_fkey (
              username,
              avatar_url
            )
          `)
          .eq('group_id', groupId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        // Verificar y marcar mensajes antiguos como eliminados
        const processedMessages = (data || []).map((message: any) => {
          const messageDate = new Date(message.created_at);
          const now = new Date();
          const hoursSinceCreation = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
          
          // Si el mensaje tiene más de 24 horas y no está marcado como eliminado
          if (hoursSinceCreation > 24 && !message.is_deleted) {
            // Actualizar en la base de datos
            supabase
              .from('group_messages')
              .update({ 
                is_deleted: true,
                content: "Este mensaje ha sido eliminado automáticamente" 
              })
              .eq('id', message.id)
              .then(() => console.log(`Mensaje grupal ${message.id} marcado como eliminado automáticamente`));
            
            // Devolver el mensaje actualizado para la UI
            return {
              id: message.id,
              content: "Este mensaje ha sido eliminado automáticamente",
              sender_id: message.sender_id,
              type: message.type as 'text' | 'audio' | 'image',
              media_url: message.media_url,
              created_at: message.created_at,
              is_deleted: true,
              sender: message.sender
            };
          }
          
          return {
            id: message.id,
            content: message.content,
            sender_id: message.sender_id,
            type: message.type as 'text' | 'audio' | 'image',
            media_url: message.media_url,
            created_at: message.created_at,
            is_deleted: typeof message.is_deleted !== 'undefined' ? Boolean(message.is_deleted) : false,
            sender: message.sender
          };
        });
        
        setGroupMessages(processedMessages);
      } catch (error) {
        console.error('Error loading group messages:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los mensajes del grupo",
        });
      }
    };

    loadGroupMessages();

    const channel = supabase
      .channel(`group-messages-${groupId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`
      }, async (payload: any) => {
        console.log('Nuevo mensaje grupal recibido:', payload.new);
        const { data: senderData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', payload.new.sender_id)
          .single();

        const newMessage: GroupMessage = {
          id: payload.new.id,
          content: payload.new.content,
          sender_id: payload.new.sender_id,
          type: payload.new.type as 'text' | 'audio' | 'image',
          media_url: payload.new.media_url,
          created_at: payload.new.created_at,
          is_deleted: Boolean(payload.new.is_deleted),
          sender: senderData || undefined
        };

        setGroupMessages(prev => [...prev, newMessage]);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`
      }, (payload: any) => {
        console.log('Mensaje grupal eliminado:', payload.old.id);
        setGroupMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`
      }, async (payload: any) => {
        console.log('Mensaje grupal actualizado:', payload.new);
        const { data: senderData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', payload.new.sender_id)
          .single();
        
        const updatedMessage: GroupMessage = {
          id: payload.new.id,
          content: payload.new.content,
          sender_id: payload.new.sender_id,
          type: payload.new.type as 'text' | 'audio' | 'image',
          media_url: payload.new.media_url,
          created_at: payload.new.created_at,
          is_deleted: Boolean(payload.new.is_deleted),
          sender: senderData || undefined
        };
        
        setGroupMessages(prev => prev.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        ));
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUserId, groupId, enabled, toast]);

  return { groupMessages };
}

export async function sendGroupMessage(
  senderId: string | null, 
  content: string, 
  groupId: string,
  type: 'text' | 'audio' | 'image' = 'text',
  mediaBlob?: Blob
) {
  if (!senderId) {
    console.error("Error: No hay ID de remitente para enviar el mensaje");
    return null;
  }

  console.info(`Enviando mensaje grupal: ${content} ${type}`);

  try {
    let media_url = null;

    if (type === 'audio' && mediaBlob) {
      const fileName = `${crypto.randomUUID()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, mediaBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      media_url = publicUrl;
    }
    
    if (type === 'image' && mediaBlob) {
      const fileName = `group_image_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, mediaBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      media_url = publicUrl;
    }

    const { data, error } = await supabase
      .from('group_messages')
      .insert({
        content,
        sender_id: senderId,
        group_id: groupId,
        type,
        media_url,
        is_deleted: false
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase group message error details:", error);
      throw error;
    }
    
    console.log('Mensaje grupal enviado correctamente:', data);
    return data;
  } catch (error) {
    console.error('Error enviando mensaje grupal:', error);
    throw error;
  }
}
