
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReactionType } from "@/types/database/social.types";

export function useStoryReactions(storyId: string) {
  const [isReacting, setIsReacting] = useState(false);
  const { toast } = useToast();

  const handleStoryReaction = async (type: ReactionType) => {
    try {
      setIsReacting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para reaccionar",
          variant: "destructive"
        });
        return;
      }
      
      // Check if user already reacted to this story
      const { data: existingReaction } = await supabase
        .from('story_reactions')
        .select()
        .eq('story_id', storyId)
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (existingReaction) {
        if (existingReaction.reaction_type === type) {
          // If same reaction, remove it
          await supabase
            .from('story_reactions')
            .delete()
            .eq('id', existingReaction.id);
        } else {
          // If different reaction, update it
          await supabase
            .from('story_reactions')
            .update({ reaction_type: type })
            .eq('id', existingReaction.id);
        }
      } else {
        // Add new reaction
        await supabase
          .from('story_reactions')
          .insert({
            story_id: storyId,
            user_id: session.user.id,
            reaction_type: type
          });
      }
      
      // Special handling for "join" reaction - though stories usually don't have projects
      if (type === 'join') {
        toast({
          title: "Reacción enviada",
          description: "Te has mostrado interesado en esta historia 🤝"
        });
      } else {
        toast({
          title: "Reacción enviada",
          description: "Tu reacción ha sido registrada"
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error al procesar la reacción:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar tu reacción",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsReacting(false);
    }
  };

  return {
    isReacting,
    handleStoryReaction
  };
}
