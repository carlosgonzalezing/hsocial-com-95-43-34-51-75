import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ImageIcon, Send } from "lucide-react";

// Local minimal types
type ReactionType = 'like' | 'love';
interface Comment {
  id: string;
  user_id: string;
  user_username?: string;
  user_avatar_url?: string | null;
  content: string;
}

interface ReelCommentModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentSubmit: (comment: string, image: File | null) => void;
  onCommentLike: (commentId: string, type: ReactionType) => void;
  onReply: (commentId: string, username: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export function ReelCommentModal({
  postId,
  isOpen,
  onClose,
  onCommentSubmit,
  onCommentLike,
  onReply,
  onDeleteComment,
}: ReelCommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadCommentsForPost(postId);
    }
  }, [isOpen, postId]);

  const loadCommentsForPost = async (postId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('comments')
        .select('*')
        .eq('post_id' as any, postId as any)
        .order('created_at' as any, { ascending: false } as any);
      if (error) {
        console.error('Error loading comments:', error);
        return [];
      }
      setComments((data as any[]) || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() && !commentImage) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El comentario no puede estar vacío",
      });
      return;
    }

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para comentar",
      });
      return;
    }

    try {
      await createComment(postId, user.id, newComment);
      setNewComment("");
      setCommentImage(null);
      loadCommentsForPost(postId); // Reload comments
      toast({
        title: "Comentario añadido",
        description: "Tu comentario se ha publicado correctamente",
      });
    } catch (error: any) {
      console.error("Error submitting comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo publicar el comentario",
      });
    }
  };

  const createComment = async (postId: string, userId: string, content: string) => {
    const { error } = await (supabase as any)
      .from('comments')
      .insert({ post_id: postId, user_id: userId, content } as any);
    if (error) throw error;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCommentImage(file);
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        isOpen ? "block" : "hidden"
      )}
    >
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-lg bg-card text-card-foreground shadow-lg">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Comentarios</h2>
        </div>
        <ScrollArea className="max-h-[400px] px-4">
          <div className="flex flex-col-reverse gap-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user_avatar_url || undefined} alt={comment.user_username || "User"} />
                  <AvatarFallback>{comment.user_username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="text-sm font-bold">{comment.user_username || "Usuario"}</div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                  <div className="flex items-center space-x-2 text-xs">
                    <Button variant="link" onClick={() => onCommentLike(comment.id, 'like')}>
                      Like
                    </Button>
                    <Button variant="link" onClick={() => onReply(comment.id, comment.user_username || "Usuario")}>
                      Responder
                    </Button>
                    {user?.id === comment.user_id && (
                      <Button variant="link" onClick={() => onDeleteComment(comment.id)}>
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4">
          <Label htmlFor="comment" className="sr-only">
            Añadir comentario
          </Label>
          <div className="relative">
            <Textarea
              id="comment"
              placeholder="Añadir comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none border-none shadow-sm focus-visible:ring-0"
            />
            <div className="absolute right-0 top-0 flex h-full items-center space-x-2 pr-2">
              <Input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Label htmlFor="image-upload" className="cursor-pointer">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">Subir imagen</span>
              </Label>
              <Button variant="ghost" size="icon" onClick={handleCommentSubmit} disabled={!newComment.trim() && !commentImage}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Enviar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
