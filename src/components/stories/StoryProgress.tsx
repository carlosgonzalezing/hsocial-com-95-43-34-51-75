
import { useState, useEffect } from "react";

interface StoryProgressProps {
  isPaused: boolean;
  currentImageIndex: number;
  totalImages: number;
  onComplete: () => void;
  onImageComplete: () => void;
  duration?: number; // Add duration as an optional parameter
}

export function StoryProgress({ 
  isPaused, 
  currentImageIndex, 
  totalImages, 
  onComplete,
  onImageComplete,
  duration = 5000 // Default to 5 seconds if not provided
}: StoryProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
  }, [currentImageIndex]);

  useEffect(() => {
    if (isPaused) return;

    const interval = 100;
    const increment = (interval / duration) * 100;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          
          if (currentImageIndex < totalImages - 1) {
            onImageComplete();
            return 0;
          } else {
            setTimeout(() => {
              onComplete();
            }, 300);
            return 100;
          }
        }
        return newProgress;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [isPaused, onComplete, onImageComplete, currentImageIndex, totalImages, duration]);

  return { progress };
}
