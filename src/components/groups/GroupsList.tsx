import { useState } from "react";
import { useGroups } from "@/hooks/use-groups";
import { GroupCard } from "./GroupCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Users2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  { value: "all", label: "Todas las categorías" },
  { value: "estudiantes", label: "Estudiantes" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "negocios", label: "Negocios" },
  { value: "diseño", label: "Diseño" },
  { value: "marketing", label: "Marketing" },
  { value: "ingenieria", label: "Ingeniería" },
  { value: "medicina", label: "Medicina" },
  { value: "educacion", label: "Educación" },
  { value: "emprendimiento", label: "Emprendimiento" },
  { value: "networking", label: "Networking" },
];

export function GroupsList() {
  const { groups, isLoadingGroups, refetchGroups } = useGroups();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Groups Grid */}
      {isLoadingGroups ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-6 space-y-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-12">
          <Users2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No se encontraron grupos
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm || selectedCategory !== "all" 
              ? "Intenta ajustar los filtros de búsqueda"
              : "Sé el primero en crear un grupo para tu comunidad"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}