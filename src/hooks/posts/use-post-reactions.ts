
import { useState, useEffect } from "react";
import { ReactionType } from "@/types/database/social.types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useSubscriptionManager } from "@/hooks/use-subscription-manager";

export function usePostReactions(postId: string) {
  const [isReacting, setIsReacting] = useState(false);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getOrCreateChannel, removeChannel } = useSubscriptionManager();

  // Verificar si el usuario ya reaccionó al post
  useEffect(() => {
    if (!postId) return;

    const checkUserReaction = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from("reactions")
          .select("reaction_type")
          .eq("post_id", postId)
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (!error && data) {
          setUserReaction(data.reaction_type as ReactionType);
        } else {
          setUserReaction(null);
        }
      } catch (error) {
        console.error("Error checking user reaction:", error);
      }
    };

    checkUserReaction();

    // Real-time updates are now handled by the main feed hook
    // No need for individual post subscriptions to avoid conflicts
  }, [postId, getOrCreateChannel, removeChannel, queryClient]);

  const onReaction = async (postId: string, type: ReactionType) => {
    console.log('usePostReactions: Starting reaction', { postId, type, currentUserReaction: userReaction });
    
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

      // Check for existing reaction
      const { data: existingReaction } = await supabase
        .from("reactions")
        .select("id, reaction_type")
        .eq("post_id", postId)
        .eq("user_id", session.user.id)
        .maybeSingle();

      // If same reaction exists, remove it (toggle off)
      if (existingReaction && existingReaction.reaction_type === type) {
        console.log('usePostReactions: Removing existing reaction');
        await supabase
          .from("reactions")
          .delete()
          .eq("id", existingReaction.id);
        
        setUserReaction(null);
        console.log('usePostReactions: Reaction removed, userReaction set to null');
      } 
      // If different reaction exists, update it
      else if (existingReaction) {
        console.log('usePostReactions: Updating existing reaction to', type);
        await supabase
          .from("reactions")
          .update({ reaction_type: type })
          .eq("id", existingReaction.id);
        
        setUserReaction(type);
        console.log('usePostReactions: Reaction updated, userReaction set to', type);
      } 
      // If no reaction exists, create one
      else {
        console.log('usePostReactions: Creating new reaction', type);
        await supabase
          .from("reactions")
          .insert({
            post_id: postId,
            user_id: session.user.id,
            reaction_type: type
          });
        
        setUserReaction(type);
        console.log('usePostReactions: New reaction created, userReaction set to', type);
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      
    } catch (error) {
      console.error("Error reacting to post:", error);
      toast({
        title: "Error",
        description: "No se pudo realizar la reacción",
        variant: "destructive"
      });
    } finally {
      setIsReacting(false);
    }
  };

  return { 
    isReacting, 
    onReaction,
    userReaction
  };
}
