
import React, { useRef, useCallback } from "react";
import { reactionIcons, type ReactionType } from "./ReactionIcons";
import { cn } from "@/lib/utils";

interface ReactionMenuProps {
  show: boolean;
  activeReaction: ReactionType | null;
  setActiveReaction: (reaction: ReactionType | null) => void;
  onReactionSelected: (type: ReactionType) => void;
  onPointerLeave: () => void;
}

export function ReactionMenu({
  show,
  activeReaction,
  setActiveReaction,
  onReactionSelected,
  onPointerLeave
}: ReactionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle pointer movement over reactions
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!menuRef.current) return;
    
    const reactionMenu = menuRef.current;
    const rect = reactionMenu.getBoundingClientRect();
    
    // Check if pointer is inside the menu
    if (
      e.clientX >= rect.left && 
      e.clientX <= rect.right && 
      e.clientY >= rect.top && 
      e.clientY <= rect.bottom
    ) {
      // Calculate which reaction is active based on horizontal position
      const reactionButtons = reactionMenu.querySelectorAll('button');
      const reactionsArray = Array.from(reactionButtons);
      
      for (let i = 0; i < reactionsArray.length; i++) {
        const buttonRect = reactionsArray[i].getBoundingClientRect();
        if (e.clientX >= buttonRect.left && e.clientX <= buttonRect.right) {
          // Reaction type is stored as data-reaction-type attribute
          const type = reactionsArray[i].getAttribute('data-reaction-type') as ReactionType;
          setActiveReaction(type);
          break;
        }
      }
    } else {
      // If pointer is outside menu, no reaction is active
      setActiveReaction(null);
    }
  }, [setActiveReaction]);

  // Handle click on a reaction
  const handleReactionClick = useCallback((type: ReactionType) => {
    onReactionSelected(type);
    // Auto-close menu after selection
    setTimeout(() => onPointerLeave(), 200);
  }, [onReactionSelected, onPointerLeave]);

  if (!show) return null;

  return (
    <div 
      ref={menuRef}
      className={cn(
        `flex bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out p-2 md:p-3 gap-1 md:gap-2 max-w-xs md:max-w-none overflow-x-auto scrollbar-hide`,
        show ? 'opacity-100 scale-100 translate-y-0 reaction-menu-enter' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={onPointerLeave}
      style={{
        transformOrigin: 'center bottom',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
    >
      {Object.entries(reactionIcons).map(([type, { icon: Icon, color, label, emoji, animationClass, size }]) => (
        <button
          key={type}
          id={`reaction-${type}`}
          name={`reaction-${type}`}
          data-reaction-type={type}
          className={cn(
            `relative flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full transition-all duration-200 ease-out group flex-shrink-0`,
            activeReaction === type 
              ? 'bg-gray-100 dark:bg-gray-700 reaction-hover z-10 shadow-lg' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110 hover:shadow-md'
          )}
          onClick={() => handleReactionClick(type as ReactionType)}
        >
          {emoji ? (
            <span className={cn(
              `leading-none transition-transform duration-200`,
              size || "text-2xl",
              activeReaction === type ? `scale-110 ${animationClass}` : ''
            )}>
              {emoji}
            </span>
          ) : (
            <Icon className={cn(
              `h-5 w-5 md:h-7 md:w-7 transition-all duration-200`,
              color,
              activeReaction === type ? `fill-current ${animationClass}` : ''
            )} />
          )}
          
          {/* Tooltip con el nombre de la reacción */}
          {activeReaction === type && (
            <div className="absolute -bottom-8 md:-bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-20 shadow-lg animate-fade-in">
              {label}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
