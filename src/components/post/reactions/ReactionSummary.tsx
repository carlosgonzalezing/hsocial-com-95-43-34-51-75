
import React, { useState } from "react";
import { reactionIcons, type ReactionType } from "./ReactionIcons";
import { ReactionsModal } from "./ReactionsModal";

interface ReactionSummaryProps {
  reactions: Record<string, number>;
  maxVisible?: number;
  postId: string;
}

export function ReactionSummary({ reactions, maxVisible = 3, postId }: ReactionSummaryProps) {
  const [showModal, setShowModal] = useState(false);
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  
  if (totalReactions === 0) {
    return null;
  }

  // Ordenar reacciones por cantidad (mayor a menor)
  const sortedReactions = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxVisible);

  return (
    <>
      <div 
        className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setShowModal(true)}
      >
        <div className="flex -space-x-1">
          {sortedReactions.map(([type, count]) => {
            const ReactionIcon = reactionIcons[type as ReactionType]?.icon;
            const color = reactionIcons[type as ReactionType]?.color;
            const emoji = reactionIcons[type as ReactionType]?.emoji;
            
            if (!ReactionIcon) return null;
            
            return (
              <div
                key={type}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-background border border-border"
                title={`${count} ${reactionIcons[type as ReactionType]?.label}`}
              >
                {emoji ? (
                  <span className="text-xs leading-none">{emoji}</span>
                ) : (
                  <ReactionIcon className={`h-3 w-3 ${color}`} />
                )}
              </div>
            );
          })}
        </div>
        <span className="ml-1">
          {totalReactions} {totalReactions === 1 ? "reacción" : "reacciones"}
        </span>
      </div>

      <ReactionsModal
        postId={postId}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        totalReactions={totalReactions}
      />
    </>
  );
}
