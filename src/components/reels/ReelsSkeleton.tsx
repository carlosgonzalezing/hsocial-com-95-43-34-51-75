
import { Skeleton } from "@/components/ui/skeleton";

export function ReelsSkeleton() {
  return (
    <div className="flex justify-center w-full h-[calc(100vh-130px)] bg-background">
      <div className="relative max-w-md w-full h-full bg-muted/30 rounded-md overflow-hidden">
        <Skeleton className="w-full h-full" />
        
        {/* Simulated UI elements */}
        <div className="absolute bottom-16 left-4 flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        
        <div className="absolute bottom-16 right-4 flex flex-col items-center gap-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
