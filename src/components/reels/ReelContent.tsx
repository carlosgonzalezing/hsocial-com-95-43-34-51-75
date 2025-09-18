
import { RefObject } from "react";
import { ProgressBar } from "./ProgressBar";
import { type Reel } from "@/types/reel";

interface ReelContentProps {
  videoRef: RefObject<HTMLVideoElement>;
  reel: Reel;
  isPlaying: boolean;
  progress: number;
}

export function ReelContent({ videoRef, reel, isPlaying, progress }: ReelContentProps) {
  return (
    <>
      <video
        ref={videoRef}
        src={reel.video_url}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        autoPlay
        loop
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
      
      {/* Add the characteristic blue line */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="h-0.5 bg-[#1EAEDB] w-full"></div>
      </div>
      
      <div className="absolute top-0 left-0 right-0 z-10">
        <ProgressBar progress={progress} />
      </div>
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-black/30 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-white"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      )}
    </>
  );
}
