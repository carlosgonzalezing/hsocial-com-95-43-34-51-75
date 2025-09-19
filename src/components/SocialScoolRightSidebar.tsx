import { 
  Users, 
  Calendar, 
  Trophy, 
  Star, 
  MapPin,
  Clock,
  BookOpen,
  Coffee,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

export function SocialScoolRightSidebar() {
  const activeUsers = [
    { name: "Emma López", status: "Estudiando en Biblioteca", avatar: "EL", isOnline: true },
    { name: "Alex Rivera", status: "En clase de Química", avatar: "AR", isOnline: true },
    { name: "Marta Ruiz", status: "Cafetería del campus", avatar: "MR", isOnline: true },
    { name: "José Díaz", status: "Laboratorio de Física", avatar: "JD", isOnline: false },
  ];

  const upcomingEvents = [
    {
      title: "Feria de Ciencias",
      date: "Mañana",
      time: "10:00 AM",
      location: "Auditorio Principal",
      attendees: 234,
      color: "bg-blue-500"
    },
    {
      title: "Torneo de Debate",
      date: "Viernes",
      time: "2:00 PM", 
      location: "Sala de Conferencias",
      attendees: 67,
      color: "bg-green-500"
    },
    {
      title: "Concierto Estudiantil",
      date: "Sábado",
      time: "7:00 PM",
      location: "Plaza Central",
      attendees: 412,
      color: "bg-purple-500"
    }
  ];

  const achievements = [
    { title: "Estudiante del Mes", icon: Star, color: "text-yellow-500", progress: 85 },
    { title: "Mentor Activo", icon: Users, color: "text-blue-500", progress: 92 },
    { title: "Participación Social", icon: Coffee, color: "text-green-500", progress: 78 },
  ];

  return (
    <aside className="w-80 h-screen sticky top-16 bg-gray-50 border-l overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Active Friends */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Users className="w-5 h-5 text-green-500 mr-2" />
              Amigos Activos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeUsers.map((user, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-r from-green-400 to-blue-400 text-white text-sm">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.status}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-3">
              Ver todos los amigos
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Calendar className="w-5 h-5 text-orange-500 mr-2" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="p-3 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full ${event.color} mt-1`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {event.date} • {event.time}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{event.attendees} asistirán</span>
                      <Button size="sm" variant="outline" className="text-xs h-6 px-2">
                        Asistir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Achievement Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
              Mis Logros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <achievement.icon className={`w-4 h-4 ${achievement.color}`} />
                    <span className="text-sm font-medium">{achievement.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">{achievement.progress}%</span>
                </div>
                <Progress value={achievement.progress} className="h-2" />
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-3">
              Ver todos los logros
            </Button>
          </CardContent>
        </Card>

        {/* Study Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <BookOpen className="w-5 h-5 text-indigo-500 mr-2" />
              Estadísticas de Estudio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg">
                <div className="font-bold text-lg text-blue-600">15h</div>
                <div className="text-xs text-blue-700">Esta semana</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-b from-green-50 to-green-100 rounded-lg">
                <div className="font-bold text-lg text-green-600">7</div>
                <div className="text-xs text-green-700">Días seguidos</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Racha de estudio</span>
              </div>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Nivel 3
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}