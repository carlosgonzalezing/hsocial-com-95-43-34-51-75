import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, ThumbsUp, Handshake } from "lucide-react";
import { ReactionType } from "@/types/database/social.types";
import { ReactionMenu } from "./ReactionMenu";
import { reactionIcons } from "./ReactionIcons";
import { useHoverSupport } from "@/hooks/use-hover-detection";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLongPress } from "./hooks/use-long-press";
import { useReactionSounds } from "@/hooks/use-reaction-sounds";

interface HoverReactionButtonProps {
  postId: string;
  userReaction: ReactionType | null;
  onReactionClick: (type: ReactionType) => void;
  postType?: string;
  isSubmitting?: boolean;
}

export function HoverReactionButton({ 
  postId, 
  userReaction, 
  onReactionClick,
  postType,
  isSubmitting = false
}: HoverReactionButtonProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(null);
  const [animatingReaction, setAnimatingReaction] = useState<ReactionType | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const supportsHover = useHoverSupport();
  const isMobile = useIsMobile();
  const { playReactionSound } = useReactionSounds();
  
  // Determinar el tipo de reacción primaria basado en el tipo de post
  const isProjectPost = postType === 'idea' || postType === 'project' || postType === 'opportunity';
  const primaryReactionType: ReactionType = isProjectPost ? "join" : "like";
  
  // Determinar qué reacción mostrar en el botón
  const currentReaction = userReaction || primaryReactionType;
  const reactionData = reactionIcons[currentReaction];
  const currentLabel = reactionData?.label || (isProjectPost ? "Me uno" : "Todo bien");
  
  // Usar long press para móviles
  const {
    showReactions: longPressShowReactions,
    activeReaction: longPressActiveReaction,
    setActiveReaction: setLongPressActiveReaction,
    setShowReactions: setLongPressShowReactions,
    handlePressStart,
    handlePressEnd
  } = useLongPress({
    longPressThreshold: 300,
    onPressEnd: (reaction) => {
      if (reaction) {
        onReactionClick(reaction);
      }
      setLongPressShowReactions(false);
      setLongPressActiveReaction(null);
    }
  });

  // Handlers para hover en desktop
  const handleMouseEnter = useCallback(() => {
    if (supportsHover && !isMobile) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowReactions(true);
    }
  }, [supportsHover, isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (supportsHover && !isMobile) {
      timeoutRef.current = setTimeout(() => {
        setShowReactions(false);
        setActiveReaction(null);
      }, 150); // Pequeño delay para permitir mover el cursor al menú
    }
  }, [supportsHover, isMobile]);

  const handleMenuMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleMenuMouseLeave = useCallback(() => {
    if (supportsHover && !isMobile) {
      setShowReactions(false);
      setActiveReaction(null);
    }
  }, [supportsHover, isMobile]);

  // Handler para seleccionar reacción
  const handleReactionSelected = useCallback((reaction: ReactionType) => {
    // Play sound and show animation
    playReactionSound(reaction);
    setAnimatingReaction(reaction);
    
    // Clear animation after it completes
    setTimeout(() => setAnimatingReaction(null), 600);
    
    onReactionClick(reaction);
    setShowReactions(false);
    setActiveReaction(null);
    setLongPressShowReactions(false);
    setLongPressActiveReaction(null);
  }, [onReactionClick, setLongPressShowReactions, setLongPressActiveReaction, playReactionSound]);

  // Click simple en el botón principal
  const handleButtonClick = useCallback(() => {
    if (!showReactions && !longPressShowReactions) {
      const reactionToApply = userReaction || primaryReactionType;
      
      // Play sound and show animation
      playReactionSound(reactionToApply);
      setAnimatingReaction(reactionToApply);
      
      // Clear animation after it completes
      setTimeout(() => setAnimatingReaction(null), 600);
      
      // Si tiene reacción y hace clic, la quita (toggle)
      if (userReaction) {
        onReactionClick(userReaction);
      } else {
        // Si no tiene reacción, aplica la primaria
        onReactionClick(primaryReactionType);
      }
    }
  }, [showReactions, longPressShowReactions, onReactionClick, userReaction, primaryReactionType, playReactionSound]);

  // Determinar si el usuario ha reaccionado
  const hasReacted = !!userReaction;
  
  // Obtener el ícono de la reacción actual
  const CurrentIcon = reactionData?.icon || (isProjectPost ? Handshake : ThumbsUp);
  const currentColor = userReaction ? reactionData?.color || 'text-primary' : '';
  const currentEmoji = userReaction ? reactionData?.emoji : null;
  
  // Usar el estado apropiado según el dispositivo
  const currentShowReactions = supportsHover && !isMobile ? showReactions : longPressShowReactions;
  const currentActiveReaction = supportsHover && !isMobile ? activeReaction : longPressActiveReaction;

  return (
    <div className="relative">
      <Button 
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className={`flex items-center px-2 py-1 transition-all duration-200 ${
          hasReacted ? `${currentColor} bg-muted/50` : 'hover:bg-muted/50'
        }`}
        onClick={handleButtonClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerDown={!supportsHover || isMobile ? handlePressStart : undefined}
        onPointerUp={!supportsHover || isMobile ? handlePressEnd : undefined}
        disabled={isSubmitting}
      >
        {currentEmoji ? (
          <span className={`mr-1.5 text-xl transition-transform duration-200 ${
            hasReacted ? `scale-110 ${reactionIcons[userReaction as ReactionType]?.animationClass || ''}` : ''
          } ${animatingReaction === currentReaction ? reactionIcons[currentReaction]?.animationClass || '' : ''}`}>
            {currentEmoji}
          </span>
        ) : (
          <CurrentIcon 
            className={`h-6 w-6 mr-1.5 transition-transform duration-200 ${
              hasReacted ? `${currentColor} fill-current scale-110 ${reactionIcons[userReaction as ReactionType]?.animationClass || ''}` : ''
            } ${animatingReaction === currentReaction ? reactionIcons[currentReaction]?.animationClass || '' : ''}`}
            strokeWidth={1.5}
          />
        )}
        <span className={`text-sm font-medium ${hasReacted ? currentColor : ''}`}>
          {currentLabel}
        </span>
      </Button>
      
      {currentShowReactions && (
        <div 
          className="absolute bottom-full left-0 mb-2 z-50"
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
        >
          <ReactionMenu
            show={currentShowReactions}
            activeReaction={currentActiveReaction}
            setActiveReaction={supportsHover && !isMobile ? setActiveReaction : setLongPressActiveReaction}
            onReactionSelected={handleReactionSelected}
            onPointerLeave={() => {
              if (!supportsHover || isMobile) {
                setLongPressShowReactions(false);
                setLongPressActiveReaction(null);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}