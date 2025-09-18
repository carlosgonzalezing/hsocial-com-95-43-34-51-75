import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Calendar, Users, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/components/Post";

interface UniversityEventsData {
  institution_name: string;
  event_count: number;
  events: any[];
}

export function UniversityEventsList() {
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);

  const { data: universities = [], isLoading } = useQuery({
    queryKey: ["university-events"],
    queryFn: async () => {
      // Get events grouped by university
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles!posts_user_id_fkey(username, avatar_url, institution_name),
          comments_count:comments!comments_post_id_fkey(count),
          reactions_count:reactions!reactions_post_id_fkey(count),
          likes:likes!likes_post_id_fkey(count)
        `)
        .eq('post_type', 'evento')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by institution
      const grouped = data?.reduce((acc: { [key: string]: UniversityEventsData }, post) => {
        const institution = (post.user as any)?.institution_name || 'Sin universidad';
        
        if (!acc[institution]) {
          acc[institution] = {
            institution_name: institution,
            event_count: 0,
            events: []
          };
        }
        
        acc[institution].event_count++;
        acc[institution].events.push({
          ...post,
          user: post.user as { username: string; avatar_url: string | null },
          comments_count: Array.isArray(post.comments_count) ? post.comments_count.length : 0,
          reactions_count: Array.isArray(post.reactions_count) ? post.reactions_count.length : 0,
          likes_count: Array.isArray(post.likes) ? post.likes.length : 0
        });
        
        return acc;
      }, {}) || {};

      return Object.values(grouped).sort((a, b) => b.event_count - a.event_count);
    },
  });

  const selectedUniversityData = universities.find(u => u.institution_name === selectedUniversity);

  if (selectedUniversity && selectedUniversityData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">{selectedUniversity}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedUniversityData.event_count} evento{selectedUniversityData.event_count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedUniversity(null)}
            className="gap-2"
          >
            Volver a universidades
          </Button>
        </div>

        <div className="space-y-4">
          {selectedUniversityData.events.map((event) => (
            <Post key={event.id} post={event} />
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (universities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No hay eventos universitarios</p>
            <p className="text-sm text-muted-foreground">
              Las universidades aún no han publicado eventos
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {universities.map((university) => (
        <Card key={university.institution_name} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">{university.institution_name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {university.event_count} evento{university.event_count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedUniversity(university.institution_name)}
                className="gap-2"
              >
                Ver eventos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}