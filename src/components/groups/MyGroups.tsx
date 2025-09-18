import { useGroups } from "@/hooks/use-groups";
import { GroupCard } from "./GroupCard";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function MyGroups() {
  const { userGroups, isLoadingUserGroups } = useGroups();

  if (isLoadingUserGroups) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (userGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No tienes grupos aún
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Únete a grupos existentes o crea uno nuevo para conectar con tu comunidad
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Crear Grupo
          </Button>
          <Button variant="outline">
            Explorar Grupos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Mis Grupos ({userGroups.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userGroups.map((group) => (
          <GroupCard 
            key={group.id} 
            group={group} 
            showJoinButton={false}
          />
        ))}
      </div>
    </div>
  );
}