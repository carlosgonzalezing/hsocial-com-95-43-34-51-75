import { Crown, Star } from "lucide-react";
import { usePremiumSubscription } from "@/hooks/use-premium-subscription";
import { cn } from "@/lib/utils";

interface PremiumFineBannerProps {
  userId?: string;
  className?: string;
  variant?: "default" | "compact";
}

export function PremiumFineBanner({ userId, className, variant = "default" }: PremiumFineBannerProps) {
  const { isPremium } = usePremiumSubscription();

  // Si se proporciona userId y es diferente del usuario actual, no podemos determinar el estado premium
  // Solo mostrar para el usuario actual o cuando no se especifica userId
  if (userId && !isPremium) return null;
  if (!userId && !isPremium) return null;

  if (variant === "compact") {
    return (
      <div className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full",
        "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600",
        "text-yellow-900 font-semibold text-xs shadow-lg",
        "border border-yellow-300",
        className
      )}>
        <Crown className="h-3 w-3" />
        <span>FINO</span>
        <Star className="h-3 w-3" />
      </div>
    );
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg p-4 mb-4",
      "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600",
      "border-2 border-yellow-300 shadow-xl",
      className
    )}>
      {/* Decorative background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 to-yellow-700/20"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300/30 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-700/30 rounded-full translate-y-12 -translate-x-12"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center gap-3">
        <Crown className="h-8 w-8 text-yellow-900" />
        <div className="text-center">
          <h3 className="text-xl font-bold text-yellow-900 mb-1">
            ✨ USUARIO FINO ✨
          </h3>
          <p className="text-sm text-yellow-800 font-medium">
            Premium Elite Member
          </p>
        </div>
        <Star className="h-8 w-8 text-yellow-900" />
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full animate-pulse"></div>
    </div>
  );
}