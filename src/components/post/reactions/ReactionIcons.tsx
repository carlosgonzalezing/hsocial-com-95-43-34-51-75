
import { Heart, ThumbsUp, Laugh, Zap, Angry, Handshake } from "lucide-react";

export const reactionIcons = {
  like: { 
    icon: ThumbsUp, 
    color: "text-primary", 
    label: "Todo bien",
    emoji: "👍",
    animationClass: "reaction-like",
    size: "text-2xl"
  },
  love: { 
    icon: Heart, 
    color: "text-red-500", 
    label: "Me encanta",
    emoji: "❤️",
    animationClass: "reaction-love",
    size: "text-2xl"
  },
  haha: { 
    icon: Laugh, 
    color: "text-yellow-500", 
    label: "Me divierte",
    emoji: "😂",
    animationClass: "reaction-haha",
    size: "text-2xl"
  },
  wow: { 
    icon: Zap, 
    color: "text-blue-500", 
    label: "Me impresiona",
    emoji: "😲",
    animationClass: "reaction-wow",
    size: "text-2xl"
  },
  angry: { 
    icon: Angry, 
    color: "text-orange-500", 
    label: "Me enoja",
    emoji: "😡",
    animationClass: "reaction-angry",
    size: "text-2xl"
  },
  poop: { 
    icon: () => <span className="text-3xl">💩</span>, 
    color: "text-amber-600", 
    label: "Caquita",
    emoji: "💩",
    animationClass: "reaction-poop",
    size: "text-3xl"
  },
  join: { 
    icon: Handshake, 
    color: "text-green-500", 
    label: "Me uno",
    emoji: "🤝",
    animationClass: "reaction-join",
    size: "text-2xl"
  }
} as const;

export type ReactionType = keyof typeof reactionIcons;
