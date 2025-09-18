import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupsList } from "./GroupsList";
import { MyGroups } from "./MyGroups";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

export function GroupsController() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Grupos</h1>
            <p className="text-muted-foreground">
              Conecta con comunidades de estudiantes, empresas y profesionales
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Crear Grupo
        </Button>
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discover">Descubrir</TabsTrigger>
          <TabsTrigger value="my-groups">Mis Grupos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="discover" className="space-y-4">
          <GroupsList />
        </TabsContent>
        
        <TabsContent value="my-groups" className="space-y-4">
          <MyGroups />
        </TabsContent>
      </Tabs>

      <CreateGroupDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}