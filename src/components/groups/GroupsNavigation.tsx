import { Button } from "@/components/ui/button";
import { Users2, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function GroupsNavigation() {
  const location = useLocation();
  const isGroupsPage = location.pathname === '/groups';

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        {!isGroupsPage && (
          <Button variant="ghost" size="sm" asChild>
            <Link to="/groups">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <Users2 className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">
          {isGroupsPage ? 'Grupos' : 'Detalle del Grupo'}
        </h1>
      </div>
    </div>
  );
}