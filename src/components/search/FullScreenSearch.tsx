import { useState, useEffect } from "react";
import { ArrowLeft, Search, X, Clock, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { getFriendSuggestions } from "@/lib/api/friends/suggestions";
import { supabase } from "@/integrations/supabase/client";
import { FriendSuggestion } from "@/lib/api/friends/types";
import { useToast } from "@/hooks/use-toast";

interface FullScreenSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  username: string;
  avatar_url: string | null;
  bio?: string;
  career?: string;
  semester?: string;
}

export function FullScreenSearch({ isOpen, onClose }: FullScreenSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [friendSuggestions, setFriendSuggestions] = useState<FriendSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const debouncedQuery = useDebounce(searchQuery, 300);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recentSearches, addSearch, removeSearch, clearAllSearches } = useRecentSearches();

  // Load friend suggestions on open
  useEffect(() => {
    if (isOpen && friendSuggestions.length === 0) {
      loadFriendSuggestions();
    }
  }, [isOpen]);

  // Perform search when query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery]);

  const loadFriendSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const suggestions = await getFriendSuggestions();
      setFriendSuggestions(suggestions.slice(0, 8)); // Show only first 8
    } catch (error) {
      console.error('Error loading friend suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, bio, avatar_url, career, semester')
        .neq('id', user.id)
        .or(`username.ilike.%${debouncedQuery}%,bio.ilike.%${debouncedQuery}%`)
        .limit(20);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo realizar la búsqueda"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserClick = (userId: string, username: string) => {
    addSearch(username, 'user');
    navigate(`/profile/${userId}`);
    onClose();
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  const sendFriendRequest = async (friendId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para enviar solicitudes de amistad"
        });
        return;
      }

      const { error } = await supabase
        .from("friend_requests")
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: "pending"
        });

      if (error) throw error;

      toast({
        title: "Solicitud enviada",
        description: "La solicitud de amistad ha sido enviada correctamente"
      });

      // Remove from suggestions
      setFriendSuggestions(prev => prev.filter(s => s.id !== friendId));
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      if (error.code === '23505') {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Ya has enviado una solicitud a este usuario"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo enviar la solicitud"
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-[100] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en HSocial"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 border-none bg-muted focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery.length >= 2 ? (
          // Search Results
          <div className="p-4">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleUserClick(user.id, user.username)}
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{user.username}</div>
                      {user.bio && (
                        <div className="text-sm text-muted-foreground truncate">
                          {user.bio}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-1">
                        {user.career && (
                          <div className="text-xs text-muted-foreground">
                            {user.career}
                          </div>
                        )}
                        {user.semester && (
                          <div className="text-xs text-muted-foreground">
                            Semestre {user.semester}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No se encontraron resultados</p>
              </div>
            )}
          </div>
        ) : (
          // Recent searches and suggestions
          <div className="space-y-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Recientes</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllSearches}
                    className="text-primary hover:text-primary/90"
                  >
                    Borrar todo
                  </Button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search) => (
                    <div
                      key={search.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors group"
                      onClick={() => handleRecentSearchClick(search.query)}
                    >
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1">{search.query}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSearch(search.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friend Suggestions */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Personas que quizás conozcas</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/90"
                  onClick={() => navigate("/friends")}
                >
                  Ver todo
                </Button>
              </div>
              
              {isLoadingSuggestions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : friendSuggestions.length > 0 ? (
                <div className="space-y-3">
                  {friendSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Avatar
                        className="cursor-pointer"
                        onClick={() => handleUserClick(suggestion.id, suggestion.username)}
                      >
                        <AvatarImage src={suggestion.avatar_url || undefined} />
                        <AvatarFallback>
                          {suggestion.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleUserClick(suggestion.id, suggestion.username)}
                      >
                        <div className="font-medium">{suggestion.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {suggestion.careerMatch && suggestion.semesterMatch 
                            ? "Misma carrera y semestre"
                            : suggestion.careerMatch 
                            ? "Misma carrera"
                            : suggestion.semesterMatch
                            ? "Mismo semestre"
                            : "Universidad sugerida"
                          }
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendFriendRequest(suggestion.id)}
                        className="flex-shrink-0"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Agregar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay sugerencias disponibles</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}