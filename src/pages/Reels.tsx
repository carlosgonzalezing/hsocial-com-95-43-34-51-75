
import { useEffect, useState } from "react";
import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { ReelsViewer } from "@/components/reels/ReelsViewer";
import { ReelsSkeleton } from "@/components/reels/ReelsSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Post } from "@/types/post";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Reels() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    async function fetchReels() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("posts")
          .select(`
            *,
            profiles:profiles(*),
            reactions:reactions(*),
            comments:comments(count)
          `)
          .eq("media_type", "video")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        const reelsData = await Promise.all(data.map(async (post: any) => {
          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          
          const userHasReacted = user && post.reactions 
            ? post.reactions.some((reaction: any) => reaction.user_id === user.id)
            : false;
          
          return {
            ...post,
            comments_count: post.comments?.[0]?.count || 0,
            reports_count: 0,
            userHasReacted,
            reactions_count: Array.isArray(post.reactions) ? post.reactions.length : 0,
          };
        }));
        
        // Filter out videos with >= 30 reports
        const filtered = reelsData.filter((p: any) => (p.reports_count || 0) < 30);
        
        setPosts(filtered as any);
      } catch (error) {
        console.error("Error fetching reels:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los reels.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchReels();
  }, [toast]);

  // Si estamos en móvil, no usamos el Layout para mostrar los reels en pantalla completa
  if (isMobile) {
    return (
      <div className="h-screen w-screen">
        {loading ? (
          <ReelsSkeleton />
        ) : posts.length > 0 ? (
          <ReelsViewer posts={posts} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <h3 className="text-xl font-semibold mb-2">No hay reels disponibles</h3>
            <p className="text-muted-foreground">Sé el primero en compartir un reel.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <FullScreenPageLayout title="Reels">
      <div className="h-full w-full">
        {loading ? (
          <ReelsSkeleton />
        ) : posts.length > 0 ? (
          <ReelsViewer posts={posts} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <h3 className="text-xl font-semibold mb-2">No hay reels disponibles</h3>
            <p className="text-muted-foreground">Sé el primero en compartir un reel.</p>
          </div>
        )}
      </div>
    </FullScreenPageLayout>
  );
}
