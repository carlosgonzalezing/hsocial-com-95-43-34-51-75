import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  UserPlus, 
  MessageCircle, 
  Users,
  Calendar,
  Zap,
  TrendingUp,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EngagementSidebar } from "@/components/engagement/EngagementSidebar";
import { useChatSystem } from "@/hooks/use-chat-system";

interface RightSidebarProps {
  currentUserId: string | null;
}

interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
  is_online?: boolean;
  last_seen?: string;
}

interface FriendSuggestion {
  id: string;
  username: string;
  avatar_url: string | null;
  mutual_friends?: number;
}

export function RightSidebar({ currentUserId }: RightSidebarProps) {
  const { openChat } = useChatSystem();
  const [onlineFriends, setOnlineFriends] = useState<Friend[]>([]);
  const [friendSuggestions, setFriendSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Load online friends and suggestions
  useEffect(() => {
    if (!currentUserId) return;

    const loadSidebarData = async () => {
      try {
        // Load friends (simulate online status for demo)
        const { data: friendsData, error: friendsError } = await supabase
          .from('friendships')
          .select(`
            friend:profiles!friendships_friend_id_fkey(
              id,
              username,
              avatar_url
            )
          `)
          .eq('user_id', currentUserId)
          .eq('status', 'accepted')
          .limit(8);

        if (friendsError) throw friendsError;

        const friends = friendsData
          ?.map(item => item.friend)
          .filter(Boolean)
          .map(friend => ({
            ...friend,
            is_online: Math.random() > 0.5, // Simulate online status
            last_seen: new Date(Date.now() - Math.random() * 3600000).toISOString()
          })) || [];

        setOnlineFriends(friends);

        // Load friend suggestions (users not yet friends with)
        const { data: suggestionsData, error: suggestionsError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .neq('id', currentUserId)
          .limit(5);

        if (suggestionsError) throw suggestionsError;

        // Filter out existing friends
        const existingFriendIds = friends.map(f => f.id);
        const suggestions = suggestionsData
          ?.filter(profile => !existingFriendIds.includes(profile.id))
          .map(profile => ({
            ...profile,
            mutual_friends: Math.floor(Math.random() * 10) // Simulate mutual friends count
          })) || [];

        setFriendSuggestions(suggestions);
      } catch (error) {
        console.error('Error loading sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSidebarData();
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="h-full bg-background border-l border-border p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="h-4 bg-muted rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background border-l border-border p-4 overflow-y-auto custom-scrollbar">
      {/* Engagement Tracker */}
      <div className="mb-6">
        <EngagementSidebar />
      </div>

      {/* Online Friends */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Contactos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {onlineFriends.length > 0 ? (
            onlineFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={friend.avatar_url || undefined} />
                    <AvatarFallback>
                      {friend.username?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  {friend.is_online && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                  )}
                </div>
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => openChat(friend.id, friend.username, friend.avatar_url)}
                >
                  <p className="text-sm font-medium truncate">{friend.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {friend.is_online ? 'Activo ahora' : 'Hace un momento'}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/profile/${friend.id}`}
                    className="p-1 rounded hover:bg-muted/70 transition-colors"
                    title="Ver perfil"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tienes amigos conectados
            </p>
          )}
        </CardContent>
      </Card>

      {/* Friend Suggestions */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Personas que podrías conocer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {friendSuggestions.length > 0 ? (
            friendSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="space-y-2">
                <Link
                  to={`/profile/${suggestion.id}`}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={suggestion.avatar_url || undefined} />
                    <AvatarFallback>
                      {suggestion.username?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{suggestion.username}</p>
                    {suggestion.mutual_friends && suggestion.mutual_friends > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {suggestion.mutual_friends} amigos en común
                      </p>
                    )}
                  </div>
                </Link>
                <div className="flex gap-2 px-2">
                  <Button size="sm" className="flex-1 h-7 text-xs">
                    Agregar
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1 h-7 text-xs">
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay sugerencias disponibles
            </p>
          )}
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tendencias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-2">
            <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <p className="text-sm font-medium">#TechNews</p>
              <p className="text-xs text-muted-foreground">15.2K publicaciones</p>
            </div>
            <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <p className="text-sm font-medium">#HSocial</p>
              <p className="text-xs text-muted-foreground">8.7K publicaciones</p>
            </div>
            <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <p className="text-sm font-medium">#OpenSource</p>
              <p className="text-xs text-muted-foreground">5.3K publicaciones</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sponsored Content */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Patrocinado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg hover:bg-muted/20 transition-colors cursor-pointer">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Lovable</p>
                  <p className="text-xs text-muted-foreground">Patrocinado</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Crea aplicaciones increíbles con IA. Prueba Lovable gratis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}