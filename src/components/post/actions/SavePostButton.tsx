import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { toggleSavedPost, isPostSaved } from "@/lib/api/saved-posts";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface SavePostButtonProps {
  postId: string;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg";
}

export function SavePostButton({ postId, variant = "ghost", size = "sm" }: SavePostButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: isSaved = false } = useQuery({
    queryKey: ["post-saved", postId],
    queryFn: () => isPostSaved(postId),
  });

  const handleToggleSave = async () => {
    try {
      setIsLoading(true);
      const newSavedState = await toggleSavedPost(postId);
      
      // Update the cache
      queryClient.setQueryData(["post-saved", postId], newSavedState);
      
      // Invalidate saved posts list to refresh it
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
      
      toast({
        title: newSavedState ? "Post guardado" : "Post removido de guardados",
        description: newSavedState 
          ? "El post se ha guardado en tu lista de guardados" 
          : "El post se ha removido de tu lista de guardados",
      });
    } catch (error) {
      console.error("Error toggling saved post:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el post. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleSave}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isSaved ? (
        <BookmarkCheck className="w-4 h-4 text-primary" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {size !== "sm" && (isSaved ? "Guardado" : "Guardar")}
    </Button>
  );
}