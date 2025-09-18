import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Reel } from "@/types/reel";
import { useAuth } from "@/hooks/use-auth";
import { giveHeartToProfile, hasGivenHeartToProfile } from "@/lib/api/hearts";
import { useToast } from "@/hooks/use-toast";
import { ReelOptionsMenu } from "./ReelOptionsMenu";
import { ReelCommentModal } from "./ReelCommentModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEngagementTracker } from "@/hooks/use-engagement-tracker";
import { ReelOptionsSimple } from "./ReelOptionsSimple";

interface MobileReelControlsProps {
  reel: Reel;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
}

export function MobileReelControls({
  reel,
  isPlaying,
  isMuted,
  isFullscreen,
  togglePlay,
  toggleMute,
  toggleFullscreen
}: MobileReelControlsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const { trackHeartGiven, trackInteraction } = useEngagementTracker();

  // Check if user has given heart to this profile
  const { data: hasGivenHeart, isLoading: heartLoading } = useQuery({
    queryKey: ['profile-heart', reel.user.id],
    queryFn: () => hasGivenHeartToProfile(reel.user.id),
    enabled: !!user
  });

  // Heart mutation
  const heartMutation = useMutation({
    mutationFn: () => giveHeartToProfile(reel.user.id),
    onSuccess: (result) => {
      if (result.removed) {
        toast({
          title: "Corazón eliminado",
          description: `Ya no das corazón a ${reel.user.username}`,
        });
      } else {
        toast({
          title: "¡Corazón enviado! 💖",
          description: `Le diste un corazón a ${reel.user.username}`,
        });
        trackHeartGiven();
      }
      queryClient.invalidateQueries({ queryKey: ['profile-heart', reel.user.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el corazón",
        variant: "destructive"
      });
    }
  });

  const handleHeartClick = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para dar corazones",
        variant: "destructive"
      });
      return;
    }

    if (user.id === reel.user.id) {
      toast({
        title: "No permitido",
        description: "No puedes darte corazones a ti mismo",
        variant: "destructive"
      });
      return;
    }

    heartMutation.mutate();
  };

  const handleCommentClick = () => {
    setShowComments(true);
    trackInteraction();
  };

  return (
    <>
      {/* Controls verticales a la derecha */}
      <div className="absolute right-3 bottom-20 z-20 flex flex-col gap-4">
        {/* Corazón al perfil */}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full text-white hover:bg-white/20 transition-all",
              hasGivenHeart && "bg-red-500/20"
            )}
            onClick={handleHeartClick}
            disabled={heartMutation.isPending || heartLoading}
          >
            <Heart 
              className={cn(
                "h-7 w-7", 
                hasGivenHeart ? "fill-red-500 text-red-500" : "text-white"
              )} 
            />
          </Button>
          <span className="text-white text-xs font-medium">
            {reel.likes_count || 0}
          </span>
        </div>

        {/* Comentarios */}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full text-white hover:bg-white/20"
            onClick={handleCommentClick}
          >
            <MessageCircle className="h-7 w-7" />
          </Button>
          <span className="text-white text-xs font-medium">
            {reel.comments_count || 0}
          </span>
        </div>

        {/* Compartir */}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full text-white hover:bg-white/20"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Reel de ${reel.user.username}`,
                  text: reel.caption || 'Mira este reel',
                  url: window.location.href
                }).catch(() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: "Enlace copiado",
                    description: "El enlace del reel se copió al portapapeles"
                  });
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: "Enlace copiado", 
                  description: "El enlace del reel se copió al portapapeles"
                });
              }
            }}
          >
            <Share className="h-7 w-7" />
          </Button>
        </div>

        {/* Opciones */}
        <div className="flex flex-col items-center gap-1">
          <ReelOptionsSimple postId={reel.id} />
        </div>
      </div>


      <ReelCommentModal
        postId={reel.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onCommentSubmit={() => {}}
        onCommentLike={() => {}}
        onReply={() => {}}
        onDeleteComment={() => {}}
      />
    </>
  );
}