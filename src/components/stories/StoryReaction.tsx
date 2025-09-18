
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { reactionIcons, type ReactionType } from "@/components/post/reactions/ReactionIcons";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StoryReactionProps {
  storyId: string;
  showReactions: boolean;
  onReact?: (type: ReactionType) => void;
  className?: string;
}

export function StoryReaction({ 
  storyId, 
  showReactions, 
  onReact,
  className 
}: StoryReactionProps) {
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleReaction = async (type: ReactionType) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setSelectedReaction(type);
      
      // Check if user is authenticated
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
      const { data: existingReaction } = await (supabase as any)
        .from('story_reactions')
        .select()
        .eq('story_id' as any, storyId as any)
        .eq('user_id' as any, session.user.id as any)
        .maybeSingle();
      
      if (existingReaction) {
        if (existingReaction.reaction_type === type) {
          // If same reaction, remove it
          await (supabase as any)
            .from('story_reactions')
            .delete()
            .eq('id' as any, (existingReaction as any).id as any);
          
          setSelectedReaction(null);
        } else {
          // If different reaction, update it
          await (supabase as any)
            .from('story_reactions')
            .update({ reaction_type: type } as any)
            .eq('id' as any, (existingReaction as any).id as any);
        }
      } else {
        // Add new reaction
        await (supabase as any)
          .from('story_reactions')
          .insert({
            story_id: storyId,
            user_id: session.user.id,
            reaction_type: type
          } as any);
      }
      
      // Call the onReact callback if provided
      if (onReact) {
        onReact(type);
      }
      
      toast({
        title: "Reacción enviada",
        description: `Has reaccionado a esta historia con ${reactionIcons[type].label}`
      });
    } catch (error) {
      console.error("Error al procesar la reacción:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar tu reacción",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showReactions) {
    return null;
  }

  return (
    <div className={cn("bg-background/80 backdrop-blur-sm rounded-full p-2 flex items-center gap-2", className)}>
      {Object.entries(reactionIcons).map(([key, { icon: Icon, color, label }]) => (
        <Button
          key={key}
          variant="ghost"
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full transition-transform hover:scale-125",
            selectedReaction === key && "scale-125", 
            color
          )}
          disabled={isSubmitting}
          onClick={() => handleReaction(key as ReactionType)}
          title={label}
        >
          <Icon className="h-6 w-6" />
        </Button>
      ))}
    </div>
  );
}
