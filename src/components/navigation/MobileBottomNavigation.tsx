import { Home, MessageCircle, User, Heart, UserPlus, Film, Users, FolderOpen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MobileBottomNavigationProps {
  currentUserId: string | null;
  unreadNotifications: number;
  newPosts: number;
  pendingRequestsCount: number;
}

export function MobileBottomNavigation({
  currentUserId,
  unreadNotifications,
  newPosts,
  pendingRequestsCount
}: MobileBottomNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide bottom navigation on specific full-screen pages
  const hideOnPaths = ['/messages', '/friend-requests', '/opportunities', '/reels', '/settings', '/popularity', '/groups', '/universidad', '/saved', '/trends'];
  const shouldHide = hideOnPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) {
    return null;
  }

  const navItems = [
    {
      icon: Home,
      label: "Inicio",
      path: "/",
      badge: newPosts > 0 ? newPosts : null
    },
    {
      icon: MessageCircle,
      label: "Mensajes",
      path: "/messages",
      badge: null
    },
    {
      icon: FolderOpen,
      label: "OpHub",
      path: "/opportunities",
      badge: null
    },
    {
      icon: Heart,
      label: "Popularidad",
      path: "/popularity",
      badge: null
    },
    {
      icon: User,
      label: "Perfil",
      path: currentUserId ? `/profile/${currentUserId}` : "/auth",
      badge: null
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 md:hidden">
      <div className="grid grid-cols-5 items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.label === "Perfil" && location.pathname.startsWith('/profile'));
          
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors relative w-full",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
              
              {item.badge && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}