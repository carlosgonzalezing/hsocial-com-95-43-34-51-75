import { useQuery } from "@tanstack/react-query";
import { Post } from "@/components/Post";
import { Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export function EventsList() {
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["events-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles!posts_user_id_fkey(username, avatar_url),
          comments_count:comments!comments_post_id_fkey(count),
          reactions_count:reactions!reactions_post_id_fkey(count),
          likes:likes!likes_post_id_fkey(count),
          academic_events!academic_events_post_id_fkey(*)
        `)
        .eq('post_type', 'evento')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      return data?.map(post => ({
        ...post,
        user: post.user as { username: string; avatar_url: string | null },
        comments_count: Array.isArray(post.comments_count) ? post.comments_count.length : 0,
        reactions_count: Array.isArray(post.reactions_count) ? post.reactions_count.length : 0,
        likes_count: Array.isArray(post.likes) ? post.likes.length : 0,
        poll: null,
        idea: null,
        marketplace: null,
        content_style: null
      } as any)) || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Cargando eventos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Error al cargar los eventos. Inténtalo de nuevo.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No hay eventos disponibles</p>
            <p className="text-sm text-muted-foreground">
              Los eventos aparecerán aquí cuando las universidades los publiquen
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        {events.length} evento{events.length !== 1 ? 's' : ''} disponible{events.length !== 1 ? 's' : ''}
      </div>
      {events.map((event) => (
        <Post key={event.id} post={event} />
      ))}
    </div>
  );
}