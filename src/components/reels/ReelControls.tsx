
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Maximize, Minimize, Pause, Play } from "lucide-react";

interface ReelControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function ReelControls({
  isPlaying,
  isMuted,
  isFullscreen,
  togglePlay,
  toggleMute,
  toggleFullscreen
}: ReelControlsProps) {
  return (
    <div className="absolute bottom-16 right-4 z-10 flex flex-col gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full bg-black/20 text-white hover:bg-black/40"
        onClick={togglePlay}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full bg-black/20 text-white hover:bg-black/40"
        onClick={toggleMute}
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full bg-black/20 text-white hover:bg-black/40"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
      </Button>
    </div>
  );
}
