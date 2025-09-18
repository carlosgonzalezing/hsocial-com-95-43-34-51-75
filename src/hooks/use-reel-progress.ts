
import { useState, useCallback } from "react";

export function useReelProgress() {
  const [progress, setProgress] = useState(0);
  
  const updateProgress = useCallback((newProgress: number) => {
    setProgress(newProgress);
  }, []);
  
  return { progress, updateProgress };
}
