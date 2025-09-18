
interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="h-1 w-full bg-white/20">
      <div 
        className="h-full bg-white transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
