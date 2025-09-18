import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, MessageCircle, Users, Bell, User, Search, Settings, UserPlus, Store, Play, Plus, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigation } from "./use-navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { FriendSearch } from "@/components/FriendSearch";
import { FullScreenSearch } from "@/components/search/FullScreenSearch";
import { UserMenu } from "@/components/user-menu/UserMenu";
import { HSocialLogo } from "./HSocialLogo";

interface TopNavigationProps {
  pendingRequestsCount: number;
}

export function TopNavigation({ pendingRequestsCount }: TopNavigationProps) {
  const {
    currentUserId,
    unreadNotifications,
    newPosts,
    handleHomeClick,
    handleNotificationClick,
    location
  } = useNavigation();
  
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showFullScreenSearch, setShowFullScreenSearch] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session?.user) {
        // Get user profile
        const { data } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', session.user.id)
          .single();
        setUserProfile(data);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        // Get user profile on auth change
        const getProfile = async () => {
          const { data } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', session.user.id)
            .single();
          setUserProfile(data);
        };
        getProfile();
      } else {
        setUserProfile(null);
      }
    });
    
    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  // Facebook-style navigation items
  const centerNavItems = [
    {
      icon: Home,
      label: "Inicio",
      path: "/",
      onClick: handleHomeClick,
      badge: newPosts > 0 ? newPosts : null,
      isActive: location.pathname === "/"
    },
    {
      icon: Users,
      label: "Amigos",
      path: "/friends",
      isActive: location.pathname.startsWith('/friends')
    },
    {
      icon: MessageCircle,
      label: "Messenger",
      path: "/messages",
      isActive: location.pathname.startsWith('/messages')
    },
    {
      icon: Store,
      label: "Marketplace",
      path: "/marketplace",
      isActive: location.pathname.startsWith('/marketplace')
    },
    {
      icon: Play,
      label: "Reels",
      path: "/opportunities",
      isActive: location.pathname.startsWith('/opportunities')
    }
  ];

  const handleProfileClick = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (currentUserId) {
      navigate(`/profile/${currentUserId}`);
    }
  };

  // Mobile navigation (Facebook-style top bar)
  if (isMobile) {
    return (
      <nav className="bg-background shadow-sm border-b border-facebook-gray-200 fixed top-0 left-0 right-0 z-[70]">
        {/* Main top bar - Facebook Mobile Style */}
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo - Left Side */}
          <HSocialLogo size="md" />
          
          {/* Navigation Icons - Right */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80"
              onClick={() => setShowFullScreenSearch(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Messenger */}
            <Button
              variant="ghost" 
              size="icon"
              className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80 relative"
              onClick={() => navigate("/messages")}
            >
              <MessageCircle className="h-5 w-5" />
              {pendingRequestsCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-facebook-red"
                >
                  {pendingRequestsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Secondary Navigation Bar - Facebook Style Icons */}
        <div className="flex items-center justify-around h-12 bg-background">
          {/* Home */}
          <Link to="/" className="flex-1 flex justify-center">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Home className={`h-6 w-6 ${location.pathname === '/' ? 'text-facebook-blue' : 'text-facebook-gray-600'}`} />
            </Button>
          </Link>

          {/* Friends */}
          <Link to="/friends" className="flex-1 flex justify-center">
            <Button variant="ghost" size="icon" className="h-10 w-10 relative">
              <Users className={`h-6 w-6 ${location.pathname.startsWith('/friends') ? 'text-facebook-blue' : 'text-facebook-gray-600'}`} />
              {pendingRequestsCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-facebook-red"
                >
                  {pendingRequestsCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Reels */}
          <Link to="/reels" className="flex-1 flex justify-center">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Play className={`h-6 w-6 ${location.pathname === '/reels' ? 'text-facebook-blue' : 'text-facebook-gray-600'}`} />
            </Button>
          </Link>

          {/* OpHub/Marketplace */}
          <Link to="/opportunities" className="flex-1 flex justify-center">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Store className={`h-6 w-6 ${location.pathname === '/opportunities' ? 'text-facebook-blue' : 'text-facebook-gray-600'}`} />
            </Button>
          </Link>

          {/* Notifications */}
          <Link to="/notifications" className="flex-1 flex justify-center">
            <Button variant="ghost" size="icon" className="h-10 w-10 relative">
              <Bell className={`h-6 w-6 ${location.pathname === '/notifications' ? 'text-facebook-blue' : 'text-facebook-gray-600'}`} />
              {unreadNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-facebook-red"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Menu */}
          <div className="flex-1 flex justify-center">
            <UserMenu />
          </div>
        </div>


        {/* Full Screen Search for Mobile */}
        <FullScreenSearch 
          isOpen={showFullScreenSearch} 
          onClose={() => setShowFullScreenSearch(false)} 
        />
      </nav>
    );
  }

  // Desktop navigation (Facebook style)
  return (
    <nav className="bg-background shadow-sm border-b border-facebook-gray-200 h-14 fixed top-0 left-0 right-0 z-[70]">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-4">
        {/* Logo and Search - Left */}
        <div className="flex items-center gap-4 flex-shrink-0 w-80">
          <HSocialLogo size="md" />
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-facebook-gray-600" />
            <Button
              variant="outline"
              className="w-full justify-start pl-10 text-facebook-gray-600 bg-facebook-gray-50 hover:bg-facebook-gray-100 border-none rounded-full h-10"
              onClick={() => setShowFullScreenSearch(true)}
            >
              Buscar en HSocial
            </Button>
          </div>
        </div>

        {/* Center Navigation - Facebook Icons */}
        <div className="flex items-center justify-center flex-1 max-w-lg">
          <div className="flex items-center">
            {centerNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={item.onClick}
                className={`flex items-center justify-center h-12 w-28 rounded-lg transition-colors relative ${
                  item.isActive
                    ? "text-facebook-blue"
                    : "text-facebook-gray-600 hover:bg-facebook-gray-100"
                }`}
              >
                <item.icon className="h-6 w-6" />
                {item.isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-1 bg-facebook-blue rounded-t"></div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Section - Facebook Icons */}
        <div className="flex items-center gap-2 flex-shrink-0 w-80 justify-end">
          {isAuthenticated && (
            <>
              {/* Profile */}
              <Button
                variant="ghost"
                className="h-10 px-2 rounded-full hover:bg-facebook-gray-100"
                onClick={handleProfileClick}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {userProfile?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>

              {/* Plus Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80"
              >
                <Plus className="h-5 w-5" />
              </Button>

              {/* Messenger */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80 relative"
                onClick={() => navigate("/messages")}
              >
                <MessageCircle className="h-5 w-5" />
                {pendingRequestsCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-facebook-red"
                  >
                    {pendingRequestsCount}
                  </Badge>
                )}
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80 relative"
                onClick={() => navigate("/notifications")}
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-facebook-red"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>

              {/* Settings Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80"
                onClick={() => navigate("/settings")}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Full Screen Search for Desktop */}
      <FullScreenSearch 
        isOpen={showFullScreenSearch} 
        onClose={() => setShowFullScreenSearch(false)} 
      />
    </nav>
  );
}