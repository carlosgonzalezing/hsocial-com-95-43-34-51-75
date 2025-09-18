import { useQuery } from "@tanstack/react-query";
import { getSavedPosts } from "@/lib/api/saved-posts";
import { Post } from "@/components/Post";
import { Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SavedPostsList() {
  const { data: savedPosts = [], isLoading, error } = useQuery({
    queryKey: ["saved-posts"],
    queryFn: getSavedPosts,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Cargando posts guardados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Error al cargar los posts guardados. Inténtalo de nuevo.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (savedPosts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">Aún no has guardado nada aquí</p>
            <p className="text-sm text-muted-foreground">
              Guarda posts que te interesen para verlos aquí más tarde
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        {savedPosts.length} post{savedPosts.length !== 1 ? 's' : ''} guardado{savedPosts.length !== 1 ? 's' : ''}
      </div>
      {savedPosts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}