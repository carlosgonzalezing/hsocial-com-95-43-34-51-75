
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Poll } from "@/types/post";
import { VoteWithUser, VotersList } from "./VotersList";

interface VotesDialogProps {
  poll: Poll;
  votes: VoteWithUser[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadVotes: () => Promise<void>;
  getPercentage: (votes: number) => number;
}

export function VotesDialog({ 
  poll, 
  votes, 
  open, 
  onOpenChange, 
  onLoadVotes,
  getPercentage 
}: VotesDialogProps) {
  const handleOpenChange = async (newOpen: boolean) => {
    if (newOpen) {
      await onLoadVotes();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
          <Eye className="h-4 w-4 mr-1" />
          Ver votos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Votos de la encuesta</DialogTitle>
        </DialogHeader>
        <VotersList 
          poll={poll}
          votes={votes}
          getPercentage={getPercentage}
        />
      </DialogContent>
    </Dialog>
  );
}
