import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getSocialLevelProgress, getSocialLevels, type SocialLevel, type SocialLevelProgress } from "@/lib/api/social-levels";
import { icons } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialLevelBadgeProps {
  socialScore: number;
  variant?: 'compact' | 'detailed' | 'banner';
  showProgress?: boolean;
  className?: string;
}

export function SocialLevelBadge({ 
  socialScore, 
  variant = 'compact', 
  showProgress = false,
  className 
}: SocialLevelBadgeProps) {
  const [levelProgress, setLevelProgress] = useState<SocialLevelProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<SocialLevel | null>(null);

  useEffect(() => {
    const loadLevelProgress = async () => {
      try {
        const progress = await getSocialLevelProgress(socialScore);
        setLevelProgress(progress);
      } catch (error) {
        console.error('Error loading social level progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLevelProgress();
  }, [socialScore]);

  useEffect(() => {
    const loadSelectedBanner = async () => {
      try {
        const stored = localStorage.getItem('selectedBannerId');
        if (!stored) {
          setSelectedLevel(null);
          return;
        }
        const levels = await getSocialLevels();
        const chosen = levels.find(l => l.id === stored) || null;
        // Always honor the user-selected banner. The selection page already enforces unlock rules.
        setSelectedLevel(chosen);

      } catch (error) {
        console.error('Error loading selected banner:', error);
        setSelectedLevel(null);
      }
    };

    loadSelectedBanner();

    const onChange = () => loadSelectedBanner();
    window.addEventListener('storage', onChange);
    window.addEventListener('hsocial-banner-change', onChange as EventListener);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener('hsocial-banner-change', onChange as EventListener);
    };
  }, [socialScore]);

  if (isLoading || !levelProgress) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-muted rounded-md w-20"></div>
      </div>
    );
  }

  const { currentLevel, nextLevel, progressPercentage } = levelProgress;
  const effectiveLevel = selectedLevel || currentLevel;
  const Icon = icons[effectiveLevel.icon_name as keyof typeof icons] || icons.User;

  const gradientStyle = {
    background: `linear-gradient(135deg, ${effectiveLevel.color_from}, ${effectiveLevel.color_to})`
  };

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary" 
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-white border-0",
                className
              )}
              style={gradientStyle}
            >
              <Icon className="h-3 w-3" />
              <span className="font-medium text-xs">{effectiveLevel.level_name}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">{effectiveLevel.level_name}</p>
              <p className="text-xs text-muted-foreground">
                {effectiveLevel.benefits?.description}
              </p>
              <p className="text-xs">
                Puntuación: {socialScore}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'banner') {
    return (
      <div 
        className={cn(
          "relative rounded-lg p-4 text-white overflow-hidden",
          className
        )}
        style={gradientStyle}
      >
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">{effectiveLevel.level_name}</h3>
            <p className="text-sm opacity-90">
              {effectiveLevel.benefits?.description}
            </p>
            {showProgress && nextLevel && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progreso al siguiente nivel</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-2 bg-white/20"
                />
                <p className="text-xs opacity-75">
                  {nextLevel.min_score - socialScore} puntos para {nextLevel.level_name}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-4 -right-4 w-20 h-20 rotate-45 bg-white/20 rounded-lg"></div>
          <div className="absolute -bottom-2 -left-2 w-16 h-16 rotate-12 bg-white/10 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Detailed variant
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="p-2 rounded-full text-white"
            style={gradientStyle}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-medium">{effectiveLevel.level_name}</h4>
            <p className="text-sm text-muted-foreground">
              Puntuación: {socialScore}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm">{effectiveLevel.benefits?.description}</p>
          
          <div className="text-xs text-muted-foreground">
            <span>💝 {effectiveLevel.benefits?.daily_hearts} corazones diarios</span>
          </div>
          
          {showProgress && nextLevel && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span>Siguiente nivel: {nextLevel.level_name}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Necesitas {nextLevel.min_score - socialScore} puntos más
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}