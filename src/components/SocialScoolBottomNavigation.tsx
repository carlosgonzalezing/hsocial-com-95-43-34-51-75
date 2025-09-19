import { 
  Home, 
  Users, 
  BookOpen, 
  MessageSquare, 
  User
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Link, useLocation } from "react-router-dom";

interface SocialScoolBottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SocialScoolBottomNavigation({ activeTab, onTabChange }: SocialScoolBottomNavigationProps) {
  const location = useLocation();
  
  const navItems = [
    { 
      id: "home", 
      icon: Home, 
      path: "/",
      color: "text-purple-600",
      activeColor: "text-purple-600 bg-purple-100"
    },
    { 
      id: "friends", 
      icon: Users, 
      path: "/friends",
      color: "text-blue-600",
      activeColor: "text-blue-600 bg-blue-100",
      badge: 3
    },
    { 
      id: "groups", 
      icon: BookOpen, 
      path: "/groups",
      color: "text-green-600",
      activeColor: "text-green-600 bg-green-100"
    },
    { 
      id: "messages", 
      icon: MessageSquare, 
      path: "/messages",
      color: "text-pink-600",
      activeColor: "text-pink-600 bg-pink-100",
      badge: 7
    },
    { 
      id: "profile", 
      icon: User, 
      path: "/profile/me",
      color: "text-indigo-600",
      activeColor: "text-indigo-600 bg-indigo-100"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50 md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || activeTab === item.id;
          return (
            <Link key={item.id} to={item.path}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center justify-center p-2 h-14 w-14 rounded-xl transition-all ${
                  isActive 
                    ? item.activeColor
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-6 h-6" />
                {item.badge && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}