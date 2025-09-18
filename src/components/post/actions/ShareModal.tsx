import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share2, Link2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { sharePost } from "@/lib/api/posts/queries/shares";
import type { Post } from "@/types/post";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
}

export function ShareModal({ isOpen, onClose, post }: ShareModalProps) {
  const [shareComment, setShareComment] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleShareToProfile = async () => {
    setIsSharing(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para compartir",
        });
        return;
      }

      // Record the share
      const shareSuccess = await sharePost(post.id, 'profile', shareComment);
      
      if (!shareSuccess) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo registrar el compartir",
        });
        return;
      }

      // Create the shared post
      const authorUsername = post.profiles?.username || "Usuario";
      const postData = {
        content: shareComment || `Compartido de ${authorUsername}: ${post.content?.substring(0, 50)}${post.content && post.content.length > 50 ? '...' : ''}`,
        user_id: userId,
        media_type: null,
        visibility: 'public' as const,
        shared_post_id: post.id
      };
      
      const { error } = await supabase
        .from('posts')
        .insert(postData);

      if (error) {
        console.error("Error creating shared post:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo compartir la publicación",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        toast({
          title: "¡Publicación compartida!",
          description: "La publicación ha sido compartida en tu perfil",
        });
        onClose();
        setShareComment("");
      }
    } catch (error) {
      console.error("Error in share function:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al compartir la publicación",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard.writeText(url);
      
      // Record the share
      await sharePost(post.id, 'link');
      
      toast({
        title: "Enlace copiado",
        description: "El enlace ha sido copiado al portapapeles",
      });
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo copiar el enlace",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Compartir publicación",
          text: post.content || "",
          url: `${window.location.origin}/post/${post.id}`,
        });
        
        // Record the share
        await sharePost(post.id, 'external');
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir publicación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Post Preview */}
          <div className="border rounded-lg p-3 bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.profiles?.avatar_url || ""} />
                <AvatarFallback>
                  {post.profiles?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {post.profiles?.username || "Usuario"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {post.content}
            </p>
          </div>

          {/* Share Comment */}
          <div>
            <label className="text-sm font-medium">
              Añade un comentario (opcional)
            </label>
            <Textarea
              value={shareComment}
              onChange={(e) => setShareComment(e.target.value)}
              placeholder="¿Qué piensas sobre esto?"
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Share Options */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleShareToProfile}
              disabled={isSharing}
              className="justify-start"
              variant="ghost"
            >
              <Users className="h-4 w-4 mr-2" />
              Compartir en mi perfil
            </Button>

            <Button
              onClick={handleCopyLink}
              variant="ghost"
              className="justify-start"
            >
              <Link2 className="h-4 w-4 mr-2" />
              Copiar enlace
            </Button>

            {navigator.share && (
              <Button
                onClick={handleNativeShare}
                variant="ghost"
                className="justify-start"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir con...
              </Button>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleShareToProfile}
              disabled={isSharing}
              className="flex-1"
            >
              {isSharing ? "Compartiendo..." : "Compartir"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}