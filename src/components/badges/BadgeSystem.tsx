import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge, Trophy, Users, Lightbulb, MessageSquare, Heart, Star, Zap, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface UserBadge {
  id: string;
  badge_type: string;
  earned_at: string;
  progress?: number;
  max_progress?: number;
}

export interface BadgeDefinition {
  type: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  requirements: {
    posts?: number;
    friends?: number;
    hearts?: number;
    comments?: number;
    projects?: number;
    days_active?: number;
  };
}

export const AVAILABLE_BADGES: BadgeDefinition[] = [
  {
    type: 'first_post',
    name: 'Primer Paso',
    description: 'Publicaste tu primera idea o proyecto',
    icon: MessageSquare,
    color: 'text-blue-500',
    requirements: { posts: 1 }
  },
  {
    type: 'popular',
    name: 'Popular',
    description: 'Recibiste 50 corazones en tus publicaciones',
    icon: Heart,
    color: 'text-red-500',
    requirements: { hearts: 50 }
  },
  {
    type: 'networker',
    name: 'Conector',
    description: 'Tienes 25 amigos en la red',
    icon: Users,
    color: 'text-green-500',
    requirements: { friends: 25 }
  },
  {
    type: 'innovator',
    name: 'Innovador',
    description: 'Compartiste 10 proyectos o ideas',
    icon: Lightbulb,
    color: 'text-yellow-500',
    requirements: { projects: 10 }
  },
  {
    type: 'active_member',
    name: 'Miembro Activo',
    description: 'Estuviste activo por 30 días',
    icon: Zap,
    color: 'text-purple-500',
    requirements: { days_active: 30 }
  },
  {
    type: 'collaborator',
    name: 'Colaborador',
    description: 'Te uniste a 5 proyectos de otros estudiantes',
    icon: Trophy,
    color: 'text-orange-500',
    requirements: { projects: 5 }
  },
  {
    type: 'influencer',
    name: 'Influencer',
    description: 'Tienes más de 100 seguidores',
    icon: Star,
    color: 'text-pink-500',
    requirements: { friends: 100 }
  },
  {
    type: 'leader',
    name: 'Líder',
    description: 'Completaste todos los badges básicos',
    icon: Award,
    color: 'text-gold-500',
    requirements: { posts: 50, friends: 50, hearts: 200 }
  }
];

interface BadgeSystemProps {
  userId: string;
  showProgress?: boolean;
}

export function BadgeSystem({ userId, showProgress = true }: BadgeSystemProps) {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [userStats, setUserStats] = useState({
    posts: 0,
    friends: 0,
    hearts: 0,
    comments: 0,
    projects: 0,
    days_active: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUserBadgesAndStats();
  }, [userId]);

  const loadUserBadgesAndStats = async () => {
    try {
      setLoading(true);
      
      // Cargar badges del usuario
      const { data: badges, error: badgesError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);

      if (badgesError) throw badgesError;

      // Cargar estadísticas del usuario
      const [postsResult, friendsResult, heartsResult] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('friendships').select('id', { count: 'exact' }).eq('user_id', userId).eq('status', 'accepted'),
        supabase.from('profile_hearts').select('id', { count: 'exact' }).eq('profile_id', userId)
      ]);

      setUserBadges(badges || []);
      setUserStats({
        posts: postsResult.count || 0,
        friends: friendsResult.count || 0,
        hearts: heartsResult.count || 0,
        comments: 0, // TODO: implementar conteo de comentarios
        projects: 0, // TODO: implementar conteo de proyectos
        days_active: 0 // TODO: implementar conteo de días activos
      });

      // Verificar si se pueden otorgar nuevos badges
      await checkAndAwardBadges();
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndAwardBadges = async () => {
    const earnedBadgeTypes = userBadges.map(b => b.badge_type);
    
    for (const badge of AVAILABLE_BADGES) {
      if (earnedBadgeTypes.includes(badge.type)) continue;
      
      const meetsRequirements = Object.entries(badge.requirements).every(([key, value]) => {
        return userStats[key as keyof typeof userStats] >= value;
      });
      
      if (meetsRequirements) {
        await awardBadge(badge.type);
      }
    }
  };

  const awardBadge = async (badgeType: string) => {
    try {
      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_type: badgeType
        });

      if (error) throw error;

      const badge = AVAILABLE_BADGES.find(b => b.type === badgeType);
      if (badge) {
        toast({
          title: "¡Nuevo Badge!",
          description: `Has obtenido el badge "${badge.name}"`,
        });
        
        // Recargar badges
        loadUserBadgesAndStats();
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  };

  const getBadgeProgress = (badge: BadgeDefinition) => {
    const requirements = Object.entries(badge.requirements);
    if (requirements.length === 0) return { current: 0, max: 1, percentage: 0 };
    
    let totalProgress = 0;
    let maxProgress = 0;
    
    requirements.forEach(([key, value]) => {
      const current = Math.min(userStats[key as keyof typeof userStats], value);
      totalProgress += current;
      maxProgress += value;
    });
    
    return {
      current: totalProgress,
      max: maxProgress,
      percentage: (totalProgress / maxProgress) * 100
    };
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const earnedBadgeTypes = userBadges.map(b => b.badge_type);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge className="h-5 w-5" />
        <h3 className="font-semibold">Insignias ({userBadges.length}/{AVAILABLE_BADGES.length})</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {AVAILABLE_BADGES.map((badge) => {
          const isEarned = earnedBadgeTypes.includes(badge.type);
          const progress = getBadgeProgress(badge);
          const IconComponent = badge.icon;
          
          return (
            <div
              key={badge.type}
              className={`
                relative p-3 rounded-lg border transition-all duration-200
                ${isEarned 
                  ? 'bg-card border-primary/20 shadow-sm' 
                  : 'bg-muted/50 border-muted'
                }
              `}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`
                  p-2 rounded-full
                  ${isEarned ? badge.color : 'text-muted-foreground'}
                `}>
                  <IconComponent className="h-6 w-6" />
                </div>
                
                <div>
                  <h4 className={`text-sm font-medium ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {badge.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {badge.description}
                  </p>
                </div>
                
                {!isEarned && showProgress && (
                  <div className="w-full">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary rounded-full h-1.5 transition-all duration-300"
                        style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(progress.percentage)}%
                    </p>
                  </div>
                )}
              </div>
              
              {isEarned && (
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                  <Trophy className="h-3 w-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}