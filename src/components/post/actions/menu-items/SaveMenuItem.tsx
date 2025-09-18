import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { toggleSavedPost, isPostSaved } from "@/lib/api/saved-posts";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface SaveMenuItemProps {
  postId: string;
}

export function SaveMenuItem({ postId }: SaveMenuItemProps) {
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
    <DropdownMenuItem 
      onClick={handleToggleSave}
      disabled={isLoading}
      className="flex items-center gap-2 cursor-pointer"
    >
      {isSaved ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {isSaved ? "Quitar de guardados" : "Guardar publicación"}
    </DropdownMenuItem>
  );
}