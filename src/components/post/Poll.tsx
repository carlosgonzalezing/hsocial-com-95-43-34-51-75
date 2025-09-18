
import { useState } from "react";
import { PollDisplay } from "./PollDisplay";
import { type Poll as PollType } from "@/types/post";
import { usePollVoteMutation } from "@/hooks/post-mutations/use-poll-vote-mutation";
import { useToast } from "@/hooks/use-toast";

interface PollProps {
  poll: PollType;
  postId: string;
}

export function Poll({ poll, postId }: PollProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(poll.user_vote || null);
  const { submitVote, isPending } = usePollVoteMutation(postId);
  const { toast } = useToast();

  const handleVote = async (optionId: string) => {
    // Don't allow voting if already voted or currently processing a vote
    if (poll.user_vote || selectedOption || isPending) {
      return;
    }
    
    console.log(`Poll vote initiated: post ${postId}, option ${optionId}`);
    
    try {
      await submitVote(optionId);
      setSelectedOption(optionId);
      console.log("Vote submitted successfully");
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar tu voto"
      });
    }
  };

  return (
    <PollDisplay 
      poll={poll} 
      postId={postId}
      userVote={selectedOption}
      onVote={handleVote}
      disabled={isPending}
    />
  );
}
