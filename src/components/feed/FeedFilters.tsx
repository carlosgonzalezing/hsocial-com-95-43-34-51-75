import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  Filter, 
  MessageSquare, 
  Lightbulb, 
  ShoppingBag, 
  Briefcase,
  Camera,
  Video,
  FileText
} from "lucide-react";

export interface FeedFiltersState {
  postTypes: string[];
  mediaTypes: string[];
  sortBy: string;
}

interface FeedFiltersProps {
  filters: FeedFiltersState;
  onFiltersChange: (filters: FeedFiltersState) => void;
}

const POST_TYPES = [
  { value: "regular", label: "Posts regulares", icon: MessageSquare },
  { value: "idea", label: "Ideas", icon: Lightbulb },
  { value: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { value: "job", label: "Empleos", icon: Briefcase }
];

const MEDIA_TYPES = [
  { value: "text", label: "Solo texto", icon: FileText },
  { value: "image", label: "Con imágenes", icon: Camera },
  { value: "video", label: "Con videos", icon: Video }
];

const SORT_OPTIONS = [
  { value: "recent", label: "Más recientes" },
  { value: "popular", label: "Más populares" },
  { value: "trending", label: "Tendencia" }
];

export function FeedFilters({ filters, onFiltersChange }: FeedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePostTypeToggle = (type: string) => {
    const newTypes = filters.postTypes.includes(type)
      ? filters.postTypes.filter(t => t !== type)
      : [...filters.postTypes, type];
    
    onFiltersChange({ ...filters, postTypes: newTypes });
  };

  const handleMediaTypeToggle = (type: string) => {
    const newTypes = filters.mediaTypes.includes(type)
      ? filters.mediaTypes.filter(t => t !== type)
      : [...filters.mediaTypes, type];
    
    onFiltersChange({ ...filters, mediaTypes: newTypes });
  };

  const handleSortChange = (sort: string) => {
    onFiltersChange({ ...filters, sortBy: sort });
  };

  const clearFilters = () => {
    onFiltersChange({
      postTypes: [],
      mediaTypes: [],
      sortBy: "recent"
    });
  };

  const activeFiltersCount = filters.postTypes.length + filters.mediaTypes.length + 
    (filters.sortBy !== "recent" ? 1 : 0);

  return (
    <div className="flex items-center gap-2 mb-4">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Tipo de contenido</DropdownMenuLabel>
          {POST_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <DropdownMenuCheckboxItem
                key={type.value}
                checked={filters.postTypes.includes(type.value)}
                onCheckedChange={() => handlePostTypeToggle(type.value)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {type.label}
              </DropdownMenuCheckboxItem>
            );
          })}

          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Tipo de media</DropdownMenuLabel>
          {MEDIA_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <DropdownMenuCheckboxItem
                key={type.value}
                checked={filters.mediaTypes.includes(type.value)}
                onCheckedChange={() => handleMediaTypeToggle(type.value)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {type.label}
              </DropdownMenuCheckboxItem>
            );
          })}

          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.sortBy === option.value}
              onCheckedChange={() => handleSortChange(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}

          {activeFiltersCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                  Limpiar filtros
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.postTypes.map((type) => {
            const postType = POST_TYPES.find(pt => pt.value === type);
            return (
              <Badge key={type} variant="secondary" className="flex items-center gap-1">
                {postType && <postType.icon className="h-3 w-3" />}
                {postType?.label}
              </Badge>
            );
          })}
          
          {filters.mediaTypes.map((type) => {
            const mediaType = MEDIA_TYPES.find(mt => mt.value === type);
            return (
              <Badge key={type} variant="secondary" className="flex items-center gap-1">
                {mediaType && <mediaType.icon className="h-3 w-3" />}
                {mediaType?.label}
              </Badge>
            );
          })}

          {filters.sortBy !== "recent" && (
            <Badge variant="secondary">
              {SORT_OPTIONS.find(o => o.value === filters.sortBy)?.label}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}