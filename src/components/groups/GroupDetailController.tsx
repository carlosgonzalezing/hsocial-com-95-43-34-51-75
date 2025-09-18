import { useParams } from "react-router-dom";
import { useGroup, useGroupPosts, useGroupMembers } from "@/hooks/use-groups";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, Settings, Globe, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function GroupDetailController() {
  const { slug } = useParams<{ slug: string }>();
  const { group, isLoading: isLoadingGroup } = useGroup(slug);
  const { posts, isLoading: isLoadingPosts } = useGroupPosts(group?.id);
  const { members, isLoading: isLoadingMembers } = useGroupMembers(group?.id);

  if (isLoadingGroup) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-muted-foreground">Grupo no encontrado</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Group Header */}
      <div className="bg-card rounded-lg p-6 border">
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={group.avatar_url || undefined} alt={group.name} />
            <AvatarFallback className="text-2xl">
              {group.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{group.name}</h1>
              {group.is_private ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Globe className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            
            {group.category && (
              <Badge variant="secondary">{group.category}</Badge>
            )}
            
            <p className="text-muted-foreground">{group.description}</p>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{group.member_count || 0} miembros</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{group.post_count || 0} publicaciones</span>
              </div>
            </div>
          </div>
          
          <Button className="gap-2">
            <Settings className="h-4 w-4" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Group Content */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Publicaciones</TabsTrigger>
          <TabsTrigger value="members">Miembros</TabsTrigger>
          <TabsTrigger value="about">Acerca de</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-4">
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Las publicaciones aparecerán aquí</p>
          </div>
        </TabsContent>
        
        <TabsContent value="members" className="space-y-4">
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Lista de miembros aparecerá aquí</p>
          </div>
        </TabsContent>
        
        <TabsContent value="about" className="space-y-4">
          <div className="bg-card rounded-lg p-6 border">
            <h3 className="font-semibold mb-3">Información del grupo</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Creado:</strong> {new Date(group.created_at).toLocaleDateString()}</p>
              <p><strong>Tipo:</strong> {group.is_private ? 'Privado' : 'Público'}</p>
              {group.rules && (
                <div>
                  <strong>Reglas:</strong>
                  <p className="mt-1 text-muted-foreground">{group.rules}</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}