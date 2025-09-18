import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "primary" | "secondary" | "white";
}

export function LoadingSpinner({ 
  size = "md", 
  className,
  color = "primary" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2", 
    lg: "h-8 w-8 border-3"
  };

  const colorClasses = {
    primary: "border-primary border-t-transparent",
    secondary: "border-secondary border-t-transparent", 
    white: "border-white border-t-transparent"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

// Pre-configured mobile-optimized loading states
export const MobileLoadingStates = {
  Button: ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" />
      {children}
    </div>
  ),
  
  Card: ({ message = "Cargando..." }: { message?: string }) => (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  ),
  
  Overlay: ({ message = "Procesando..." }: { message?: string }) => (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center space-y-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  ),
  
  Inline: ({ size = "sm" }: { size?: "sm" | "md" | "lg" }) => (
    <LoadingSpinner size={size} className="inline-block" />
  )
};