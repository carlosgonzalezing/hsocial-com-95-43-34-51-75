
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, X, Star, MessageCircle, BookOpen, Users } from "lucide-react";
import { MatchProfile } from "@/types/matchmaking";
import { cn } from "@/lib/utils";

interface ProfileMatchCardProps {
  profile: MatchProfile;
  onLike: (profileId: string) => void;
  onPass: (profileId: string) => void;
  onSuperLike: (profileId: string) => void;
  isActive?: boolean;
}

export function ProfileMatchCard({ 
  profile, 
  onLike, 
  onPass, 
  onSuperLike, 
  isActive = false 
}: ProfileMatchCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const compatibilityColor = profile.compatibility_score >= 80 
    ? "text-green-500" 
    : profile.compatibility_score >= 60 
    ? "text-yellow-500" 
    : "text-orange-500";

  return (
    <Card className={cn(
      "relative overflow-hidden h-full w-full max-w-sm mx-auto bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200",
      isActive && "ring-2 ring-pink-400 ring-offset-2"
    )}>
      {/* Header con indicador de compatibilidad */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
          <Heart className={cn("h-3 w-3 mr-1", compatibilityColor)} />
          {profile.compatibility_score}%
        </Badge>
      </div>

      {/* Indicador online */}
      {profile.is_online && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center bg-green-500 text-white px-2 py-1 rounded-full text-xs">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
            En línea
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="p-6 flex flex-col items-center justify-center h-full text-center space-y-4">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-2xl font-bold">
              {profile.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Información básica */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-800">
            {profile.username}
          </h3>
          
          {profile.career && (
            <div className="flex items-center justify-center text-sm text-gray-600">
              <BookOpen className="h-4 w-4 mr-1" />
              {profile.career}
              {profile.semester && ` - ${profile.semester}`}
            </div>
          )}

          {profile.mutual_friends_count > 0 && (
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              {profile.mutual_friends_count} amigos en común
            </div>
          )}
        </div>

        {/* Intereses compartidos */}
        {profile.shared_interests.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Intereses compartidos:</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {profile.shared_interests.slice(0, 3).map((interest, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-white/80">
                  {interest}
                </Badge>
              ))}
              {profile.shared_interests.length > 3 && (
                <Badge variant="outline" className="text-xs bg-white/80">
                  +{profile.shared_interests.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Bio corta */}
        {profile.bio && (
          <p className="text-sm text-gray-600 max-w-xs line-clamp-2">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Botones de acción */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white/90 hover:bg-red-50 border-red-200 hover:border-red-400"
          onClick={() => onPass(profile.id)}
        >
          <X className="h-5 w-5 text-red-500" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white/90 hover:bg-blue-50 border-blue-200 hover:border-blue-400"
          onClick={() => onSuperLike(profile.id)}
        >
          <Star className="h-5 w-5 text-blue-500" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white/90 hover:bg-green-50 border-green-200 hover:border-green-400"
          onClick={() => onLike(profile.id)}
        >
          <Heart className="h-5 w-5 text-green-500" />
        </Button>
      </div>

      {/* Efecto de brillo */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none"></div>
    </Card>
  );
}
