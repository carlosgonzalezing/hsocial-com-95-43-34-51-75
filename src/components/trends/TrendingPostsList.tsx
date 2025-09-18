import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTrendingPosts, getTopPostsToday } from "@/lib/api/trending-posts";
import { Post } from "@/components/Post";
import { Loader, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type TrendingTab = 'trending' | 'today';

export function TrendingPostsList() {
  const [activeTab, setActiveTab] = useState<TrendingTab>('trending');

  const { data: trendingPosts = [], isLoading: loadingTrending } = useQuery({
    queryKey: ["trending-posts"],
    queryFn: () => getTrendingPosts(20),
    enabled: activeTab === 'trending',
  });

  const { data: todayPosts = [], isLoading: loadingToday } = useQuery({
    queryKey: ["top-posts-today"],
    queryFn: () => getTopPostsToday(10),
    enabled: activeTab === 'today',
  });

  const posts = activeTab === 'trending' ? trendingPosts : todayPosts;
  const isLoading = activeTab === 'trending' ? loadingTrending : loadingToday;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Cargando tendencias...</span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'trending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('trending')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Tendencias
          </Button>
          <Button
            variant={activeTab === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('today')}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Hoy
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">
                No hay {activeTab === 'trending' ? 'tendencias' : 'posts populares'} disponibles
              </p>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'trending' 
                  ? 'Las tendencias se actualizan en base a la actividad reciente'
                  : 'No hay posts con suficiente actividad hoy'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'trending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('trending')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Tendencias
        </Button>
        <Button
          variant={activeTab === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('today')}
          className="flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Hoy
        </Button>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        {posts.length} post{posts.length !== 1 ? 's' : ''} {activeTab === 'trending' ? 'en tendencia' : 'populares hoy'}
      </div>
      
      {posts.map((post, index) => (
        <div key={post.id} className="relative">
          <div className="absolute -left-4 top-4 z-10 bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {index + 1}
          </div>
          <Post post={post} />
        </div>
      ))}
    </div>
  );
}