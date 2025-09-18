
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdvancedSearch } from "./search/AdvancedSearch";

export function FriendSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedSearch.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Search users by username and bio
        const { data, error } = await (supabase as any)
          .from('profiles')
          .select('id, username, bio, avatar_url')
          .neq('id', user.id)
          .or(`username.ilike.%${debouncedSearch}%,bio.ilike.%${debouncedSearch}%`)
          .limit(5);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching users:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo realizar la búsqueda"
        });
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [debouncedSearch, toast]);

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    setSearchQuery("");
    setSearchResults([]);
  };

  const getFirstName = (username: string) => {
    return username?.split(' ')[0] || 'Usuario';
  };

  return (
    <>
      <div ref={searchRef} className="relative w-full">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 rounded-full border-gray-200 dark:border-gray-700 h-9 shadow-sm w-full"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowAdvanced(true)}
            className="rounded-full h-9 w-9 shrink-0"
            title="Búsqueda avanzada"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      {searchResults.length > 0 && (
        <Card className="absolute w-full mt-1 p-2 z-50 shadow-lg">
          <div className="space-y-2">
            {searchResults.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center p-2 rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => handleUserClick(user.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{getFirstName(user.username || 'Usuario')}</div>
                    {user.bio && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {user.bio}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {isSearching && searchQuery.length >= 2 && (
        <Card className="absolute w-full mt-1 p-4 z-50 shadow-lg">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </Card>
      )}
      </div>

      <AdvancedSearch 
        isOpen={showAdvanced} 
        onClose={() => setShowAdvanced(false)} 
      />
    </>
  );
}
