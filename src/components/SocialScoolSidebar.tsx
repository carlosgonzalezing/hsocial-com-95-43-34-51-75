import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  Trophy, 
  Settings,
  GraduationCap,
  Coffee,
  MapPin,
  TrendingUp
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Link, useLocation } from "react-router-dom";

export function SocialScoolSidebar() {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Inicio", path: "/", active: location.pathname === "/", color: "text-purple-600" },
    { icon: Users, label: "Mis Amigos", path: "/friends", count: 42, color: "text-blue-600" },
    { icon: BookOpen, label: "Grupos de Estudio", path: "/groups", count: 3, color: "text-green-600" },
    { icon: Calendar, label: "Eventos", path: "/events", count: 5, color: "text-orange-600" },
    { icon: MessageSquare, label: "Mensajes", path: "/messages", count: 12, color: "text-pink-600" },
    { icon: Trophy, label: "Logros", path: "/achievements", color: "text-yellow-600" },
    { icon: GraduationCap, label: "Mi Universidad", path: "/universidad", color: "text-indigo-600" },
  ];

  const trendingTopics = [
    { tag: "#ExamenesFinal", posts: 234 },
    { tag: "#EstudioGrupal", posts: 156 },
    { tag: "#NuevoCafé", posts: 89 },
    { tag: "#ProyectoFinal", posts: 67 },
  ];

  const suggestedFriends = [
    { name: "Carlos Mendez", course: "Medicina", mutualFriends: 5, avatar: "CM" },
    { name: "Sofia Rodriguez", course: "Psicología", mutualFriends: 3, avatar: "SR" },
    { name: "Miguel Torres", course: "Arquitectura", mutualFriends: 8, avatar: "MT" },
  ];

  return (
    <aside className="w-80 h-screen sticky top-16 bg-gray-50 border-r overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Navigation Menu */}
        <Card>
          <CardContent className="p-3">
            <nav className="space-y-1">
              {menuItems.map((item, index) => (
                <Link key={index} to={item.path}>
                  <Button
                    variant={item.active ? "secondary" : "ghost"}
                    className={`w-full justify-start h-10 ${item.active ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700' : 'hover:bg-gray-100'}`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${item.color}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.count && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.count}
                      </Badge>
                    )}
                  </Button>
                </Link>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Trending Topics */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <TrendingUp className="w-5 h-5 text-orange-500 mr-2" />
              <h3 className="font-semibold">Tendencias</h3>
            </div>
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                      {topic.tag}
                    </p>
                    <p className="text-xs text-gray-500">{topic.posts} publicaciones</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggested Friends */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <Users className="w-5 h-5 text-green-500 mr-2" />
              <h3 className="font-semibold">Sugerencias</h3>
            </div>
            <div className="space-y-3">
              {suggestedFriends.map((friend, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-400 text-white">
                      {friend.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{friend.name}</p>
                    <p className="text-xs text-gray-500">{friend.course}</p>
                    <p className="text-xs text-gray-400">{friend.mutualFriends} amigos en común</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs px-2">
                    Agregar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campus Events */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <Calendar className="w-5 h-5 text-red-500 mr-2" />
              <h3 className="font-semibold">Eventos Cercanos</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                <div className="flex items-start space-x-2">
                  <Coffee className="w-4 h-4 text-orange-500 mt-1" />
                  <div>
                    <p className="font-medium text-sm">Noche de Café y Estudio</p>
                    <p className="text-xs text-gray-600">Hoy, 7:00 PM</p>
                    <div className="flex items-center mt-1">
                      <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-500">Biblioteca Central</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}