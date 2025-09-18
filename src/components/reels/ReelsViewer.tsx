
import { useState, useEffect, useRef } from "react";
import { Post } from "@/types/post";
import { ReelCard } from "./ReelCard";
import { ChevronUp, ChevronDown, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reel } from "@/types/reel";
import { useIsMobile } from "@/hooks/use-mobile";

import { supabase } from "@/integrations/supabase/client";
import { useSoundConsent } from "@/hooks/use-sound-consent";

interface ReelsViewerProps {
  posts: Post[];
}

export function ReelsViewer({ posts }: ReelsViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTime = useRef<number>(0);
  const isMobile = useIsMobile();
  
  
  const { hasConsent, grantConsent } = useSoundConsent();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const handleNext = () => {
    if (currentIndex < posts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleSwipe = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      handleNext();
    } else {
      handlePrevious();
    }
  };


  // Manejar el desplazamiento con la rueda del mouse (solo en desktop)
  useEffect(() => {
    if (isMobile) return;
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const now = Date.now();
      if (now - lastScrollTime.current < 500) {
        return;
      }
      
      lastScrollTime.current = now;
      
      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
      }
      
      wheelTimeout.current = setTimeout(() => {
        if (e.deltaY > 0) {
          handleNext();
        } else {
          handlePrevious();
        }
      }, 50);
    };
    
    const currentScrollRef = scrollRef.current;
    if (currentScrollRef) {
      currentScrollRef.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      if (currentScrollRef) {
        currentScrollRef.removeEventListener('wheel', handleWheel);
      }
      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
      }
    };
  }, [currentIndex, isMobile]);

  // Convert posts to reels
  const reels: Reel[] = posts.map(post => ({
    id: post.id,
    user: {
      id: post.profiles?.id || post.user_id,
      username: post.profiles?.username || 'Unknown',
      avatar_url: post.profiles?.avatar_url
    },
    video_url: post.media_url || '',
    caption: post.content || '',
    likes_count: post.reactions_count || 0,
    comments_count: post.comments_count || 0,
    is_muted: false,
    created_at: post.created_at
  }));

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h3 className="text-xl font-semibold mb-2">No hay reels disponibles</h3>
        <p className="text-muted-foreground">Sé el primero en compartir un reel.</p>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className={`relative ${isMobile ? 'h-screen w-screen fixed top-0 left-0 z-50' : 'h-[calc(100vh-130px)] w-full'} overflow-hidden bg-black`}
    >
      {/* Characteristic blue line */}
      <div className="h-0.5 bg-[#1EAEDB] w-full absolute top-0 left-0 z-50"></div>

      {/* Content */}
      <div className="absolute inset-0">
        {reels.length > 0 && (
          <ReelCard 
            reel={reels[currentIndex]} 
            isActive={true}
            onSwipe={handleSwipe}
            soundConsent={hasConsent}
            onGrantSound={grantConsent}
          />
        )}
      </div>
      
      {/* Navigation controls - only show on desktop */}
      {!isMobile && reels.length > 1 && (
        <div className="absolute right-4 bottom-1/2 transform translate-y-1/2 flex flex-col gap-2">
          {currentIndex > 0 && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-background/20 text-white hover:bg-background/40"
              onClick={handlePrevious}
              aria-label="Previous reel"
            >
              <ChevronUp className="h-6 w-6" />
            </Button>
          )}
          
          {currentIndex < reels.length - 1 && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-background/20 text-white hover:bg-background/40"
              onClick={handleNext}
              aria-label="Next reel"
            >
              <ChevronDown className="h-6 w-6" />
            </Button>
          )}
        </div>
      )}
      
      {/* Single close button - only for mobile full-screen mode */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 bg-black/50 text-white rounded-full hover:bg-black/70 h-8 w-8"
          onClick={() => window.history.back()}
          aria-label="Close reels"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        </Button>
      )}
    </div>
  );
}
