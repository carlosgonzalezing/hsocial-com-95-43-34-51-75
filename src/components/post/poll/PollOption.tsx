
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

interface PollOptionProps {
  id: string;
  content: string;
  votes: number;
  percentage: number;
  isSelected: boolean;
  hasVoted: boolean;
  isVoting: boolean;
  onVote: (id: string) => void;
}

export function PollOption({
  id,
  content,
  votes,
  percentage,
  isSelected,
  hasVoted,
  isVoting,
  onVote
}: PollOptionProps) {
  return (
    <div className="relative">
      {hasVoted ? (
        <div className="relative bg-muted/30 rounded-md p-3">
          <div className="flex justify-between items-center">
            <span className="font-medium flex-1">{content}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">{percentage}%</span>
              {isSelected && <Check className="h-4 w-4 text-green-500" />}
            </div>
          </div>
          <Progress value={percentage} className="mt-2 h-1.5" />
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full justify-start h-auto py-3 font-normal hover:bg-primary/10"
          disabled={isVoting}
          onClick={() => onVote(id)}
        >
          {content}
        </Button>
      )}
    </div>
  );
}
