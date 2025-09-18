import { useCallback } from "react";
import { useSoundConsent } from "./use-sound-consent";
import { ReactionType } from "@/types/database/social.types";

// Sound URLs for each reaction type
const REACTION_SOUNDS: Record<ReactionType, string> = {
  like: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaAjiK0fPTgjEGJG7C7+OZYA0PVanm7q9dGAg6m+fwwGoiBC12w+7gjj8JEU627uynVDcJQ5zg8L5kHwU1iNLuyn8vBy1+w+/fkT4JG2K//OuTTQ==",
  love: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaAjiK0fPTgjEGJG7C7+OZYA0PVanm7q9dGAg6m+fwwGoiBC12w+7gjj8JEU627uynVBcJQ5zg8L5kHwU1iNLuyn8vBy1+w+/fkT4JG2K//OuTTQ==",
  haha: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaAjiK0fPTgjEGJG7C7+OZYA0PVanm7q9dGAg6m+fwwGoiBC12w+7gjj8JEU627uynVBcJQ5zg8L5kHwU1iNLuyn8vBy1+w+/fkT4JG2K//OuTTQ==",
  wow: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaAjiK0fPTgjEGJG7C7+OZYA0PVanm7q9dGAg6m+fwwGoiBC12w+7gjj8JEU627uynVBcJQ5zg8L5kHwU1iNLuyn8vBy1+w+/fkT4JG2K//OuTTQ==",
  angry: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaAjiK0fPTgjEGJG7C7+OZYA0PVanm7q9dGAg6m+fwwGoiBC12w+7gjj8JEU627uynVBcJQ5zg8L5kHwU1iNLuyn8vBy1+w+/fkT4JG2K//OuTTQ==",
  poop: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaAjiK0fPTgjEGJG7C7+OZYA0PVanm7q9dGAg6m+fwwGoiBC12w+7gjj8JEU627uynVBcJQ5zg8L5kHwU1iNLuyn8vBy1+w+/fkT4JG2K//OuTTQ==",
  join: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaAjiK0fPTgjEGJG7C7+OZYA0PVanm7q9dGAg6m+fwwGoiBC12w+7gjj8JEU627uynVBcJQ5zg8L5kHwU1iNLuyn8vBy1+w+/fkT4JG2K//OuTTQ=="
};

export function useReactionSounds() {
  const { hasConsent } = useSoundConsent();

  const playReactionSound = useCallback((reactionType: ReactionType) => {
    if (!hasConsent) return;

    try {
      const audio = new Audio(REACTION_SOUNDS[reactionType]);
      audio.volume = 0.3;
      audio.play().catch(console.warn);
    } catch (error) {
      console.warn('Failed to play reaction sound:', error);
    }
  }, [hasConsent]);

  return { playReactionSound };
}