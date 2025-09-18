
import { useState, useRef, useEffect, TouchEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInView } from "react-intersection-observer";
import { useReelControls } from "@/hooks/use-reel-controls";
import { ReelHeader } from "./ReelHeader";
import { ReelContent } from "./ReelContent";
import { ReelControls } from "./ReelControls";
import { MobileReelControls } from "./MobileReelControls";
import { ReelFooter } from "./ReelFooter";
import { useReelProgress } from "@/hooks/use-reel-progress";
import { cn } from "@/lib/utils";
import { type Reel } from "@/types/reel";
import { useIsMobile } from "@/hooks/use-mobile";

interface ReelCardProps {
  reel: Reel;
  isActive?: boolean;
  onSwipe?: (direction: 'up' | 'down') => void;
  soundConsent?: boolean;
  onGrantSound?: () => void;
}

export function ReelCard({ reel, isActive = false, onSwipe, soundConsent = false, onGrantSound }: ReelCardProps) {
  const { ref, inView } = useInView({
    threshold: 0.6,
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  
  // Touch handling for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const { 
    isPlaying,
    isMuted,
    togglePlay,
    toggleMute,
    handleReelClick,
    toggleFullscreen,
    enableFullscreen
  } = useReelControls(videoRef, setIsFullscreen);

  const { progress, updateProgress } = useReelProgress();

  // Handle touch events for mobile swipe
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
    setTouchEnd(null);
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !onSwipe) return;
    
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > 50; // Minimum distance for a swipe
    
    if (isSwipe) {
      // Cuando deslizas hacia arriba (distance positiva), mostramos el siguiente reel (abajo)
      // Cuando deslizas hacia abajo (distance negativa), mostramos el anterior reel (arriba)
      onSwipe(distance > 0 ? 'up' : 'down');
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Desactivado: No activar pantalla completa automáticamente en desktop; solo mediante botón

  // Handle autoplay when in view and active
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (inView && isActive) {
      if (video.paused) {
        // Intentar autoplay con sonido; si falla, reintentar en mute
        const attemptPlay = () => {
          try {
            video.muted = false; // dispara volumechange
            const p = video.play();
            if (p && typeof p.catch === 'function') {
              p.catch(err => {
                console.warn("Autoplay con sonido bloqueado, reintentando en mute:", err);
                video.muted = true;
                video.play().catch(e2 => console.error("Autoplay falló:", e2));
              });
            }
          } catch (err) {
            console.warn("Autoplay con sonido lanzó excepción, reintentando en mute:", err);
            video.muted = true;
            video.play().catch(e2 => console.error("Autoplay falló:", e2));
          }
        };
        attemptPlay();
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
    }
  }, [inView, isActive]);

  // If user granted sound consent, unmute and try to play
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (soundConsent) {
      try {
        video.muted = false;
        const p = video.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {});
        }
      } catch {}
    }
  }, [soundConsent]);

  // Track video progress
  useEffect(() => {
    const handleProgressUpdate = () => {
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;
        if (duration > 0) {
          updateProgress((currentTime / duration) * 100);
        }
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', handleProgressUpdate);
      return () => {
        video.removeEventListener('timeupdate', handleProgressUpdate);
      };
    }
  }, [updateProgress]);

  return (
    <div 
      ref={ref}
      className={cn(
        "h-full w-full max-w-sm mx-auto flex flex-col reel-card", 
        (isFullscreen || isMobile) && "fixed inset-0 z-50 max-w-none bg-black"
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Card className={cn(
        "relative overflow-hidden h-full w-full border-0 bg-black rounded-lg transition-all duration-200 shadow-md",
        (isFullscreen || isMobile) && "rounded-none shadow-none"
      )}>
        <div className="absolute inset-0" onClick={handleReelClick}>
          <ReelContent
            videoRef={videoRef}
            reel={reel}
            isPlaying={isPlaying}
            progress={progress}
          />
        </div>
        
        {isMobile && isPlaying && isMuted && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40">
            <Button
              size="sm"
              variant="secondary"
              className="bg-background/60 text-foreground border border-border backdrop-blur-sm"
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                v.muted = false;
                v.play().catch(() => {});
                onGrantSound?.();
              }}
              aria-label="Activar sonido"
            >
              Activar sonido
            </Button>
          </div>
        )}
        
        <ReelHeader 
          reel={reel} 
          isFullscreen={isFullscreen || isMobile}
        />
        
        {isMobile ? (
          <MobileReelControls
            reel={reel}
            isPlaying={isPlaying}
            isMuted={isMuted}
            togglePlay={togglePlay}
            toggleMute={toggleMute}
            toggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen || isMobile}
          />
        ) : (
          <ReelControls
            isPlaying={isPlaying}
            isMuted={isMuted}
            togglePlay={togglePlay}
            toggleMute={toggleMute}
            toggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen || isMobile}
          />
        )}
        
        {!isMobile && (
          <ReelFooter postId={reel.id} userId={reel.user.id} />
        )}
      </Card>
    </div>
  );
}
