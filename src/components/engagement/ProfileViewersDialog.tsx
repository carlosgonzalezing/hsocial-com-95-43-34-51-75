import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Crown, Calendar, Users, Clock } from "lucide-react";
import { getProfileViewStats, type ProfileViewStats } from "@/lib/api/profile-viewers";
import { usePremiumSubscription } from "@/hooks/use-premium-subscription";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface ProfileViewersDialogProps {
  children: React.ReactNode;
}

export function ProfileViewersDialog({ children }: ProfileViewersDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewStats, setViewStats] = useState<ProfileViewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isPremium, refreshPremiumStatus } = usePremiumSubscription();

  useEffect(() => {
    if (isOpen) {
      refreshPremiumStatus();
    }
  }, [isOpen]);

  const loadViewStats = async () => {
    if (!isPremium) return;
    
    setIsLoading(true);
    try {
      const stats = await getProfileViewStats();
      setViewStats(stats);
    } catch (error) {
      console.error('Error loading view stats:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas de visualización",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isPremium) {
      loadViewStats();
    }
  }, [isOpen, isPremium]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setViewStats(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Quién vio tu perfil
          </DialogTitle>
        </DialogHeader>

        {!isPremium ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Función Premium</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Descubre quién está visitando tu perfil con una suscripción premium
              </p>
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Premium Requerido
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>✨ Ve quién visita tu perfil</p>
              <p>📊 Estadísticas detalladas</p>
              <p>🔍 Filtros por fecha</p>
              <p>👻 Modo anónimo disponible</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Statistics Summary */}
            {viewStats && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{viewStats.todayViews}</div>
                  <div className="text-xs text-muted-foreground">Hoy</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{viewStats.totalViews}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            )}

            <Tabs defaultValue="recent" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recent" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Recientes
                </TabsTrigger>
                <TabsTrigger value="today" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Hoy
                </TabsTrigger>
                <TabsTrigger value="week" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Semana
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="space-y-2 mt-4">
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                        <div className="h-10 w-10 bg-muted rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-1/2 mb-1"></div>
                          <div className="h-3 bg-muted rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : viewStats?.viewers && viewStats.viewers.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {viewStats.viewers.slice(0, 20).map((viewer) => (
                      <div key={viewer.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={viewer.viewer_profile?.avatar_url} 
                            alt={viewer.viewer_profile?.username || 'Usuario'} 
                          />
                          <AvatarFallback>
                            {viewer.is_anonymous ? '👻' : (viewer.viewer_profile?.username?.[0] || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {viewer.is_anonymous ? 'Usuario Anónimo' : (viewer.viewer_profile?.username || 'Usuario')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(viewer.viewed_at), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </p>
                        </div>
                        {viewer.is_anonymous && (
                          <Badge variant="outline" className="text-xs">
                            Anónimo
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Aún no hay visualizaciones</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="today" className="mt-4">
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {viewStats?.todayViews || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Visualizaciones hoy
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="week" className="mt-4">
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {viewStats?.weekViews || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Visualizaciones esta semana
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}