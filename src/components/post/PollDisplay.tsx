
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Poll } from "@/types/post";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePollVoteMutation } from "@/hooks/post-mutations/use-poll-vote-mutation";
import { PollOption } from "./poll/PollOption";
import { VotesDialog } from "./poll/VotesDialog";
import { VoteWithUser } from "./poll/VotersList";
import { fetchPollWithVotes } from "@/lib/api/posts/queries/polls";

interface PollDisplayProps {
  postId: string;
  poll: Poll;
  onVote?: (optionId: string) => Promise<void>;
  disabled?: boolean;
  userVote?: string | null;
}

export function PollDisplay({ postId, poll: initialPoll, onVote, disabled = false, userVote }: PollDisplayProps) {
  const [poll, setPoll] = useState(initialPoll);
  const [showVotesDialog, setShowVotesDialog] = useState(false);
  const [votes, setVotes] = useState<VoteWithUser[]>([]);
  const { toast } = useToast();
  const { submitVote, isPending } = usePollVoteMutation(postId);

  // Update poll data when it changes
  useEffect(() => {
    setPoll(initialPoll);
  }, [initialPoll]);

  // Refresh poll data after voting
  useEffect(() => {
    const refreshPollData = async () => {
      if (poll.user_vote) {
        const updatedPoll = await fetchPollWithVotes(postId);
        if (updatedPoll) {
          setPoll(updatedPoll);
        }
      }
    };
    refreshPollData();
  }, [poll.user_vote, postId]);

  const handleVote = async (optionId: string) => {
    // If user has already voted or we're currently processing a vote, don't do anything
    if (poll.user_vote || isPending || disabled) return;
    
    try {
      if (onVote) {
        await onVote(optionId);
      } else {
        // Default voting behavior
        await submitVote(optionId);
        
        // Refresh poll data after successful vote
        const updatedPoll = await fetchPollWithVotes(postId);
        if (updatedPoll) {
          setPoll(updatedPoll);
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al votar",
        description: error.message || "No se pudo registrar tu voto",
      });
    }
  };

  const getPercentage = (votes: number) => {
    const totalVotes = poll.total_votes || 0;
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const loadVotes = async () => {
    try {
      const { data: votesData, error } = await (supabase as any)
        .from('poll_votes')
        .select(`
          id,
          option_id,
          profiles (
            username,
            avatar_url
          ),
          created_at
        `)
        .eq('post_id', postId);

      if (error) throw error;
      
      // Filter out votes without profiles
      const validVotes = (votesData as any[]).filter((vote: any) => vote.profiles) as VoteWithUser[];
      setVotes(validVotes);
    } catch (error) {
      console.error('Error loading votes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los votos",
      });
    }
  };

  const hasVoted = !!poll.user_vote || !!userVote || disabled;

  return (
    <div className="space-y-4 mt-4 bg-background rounded-lg p-4">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">
          {poll.question}
        </h3>
        {!hasVoted && (
          <p className="text-sm text-muted-foreground">
            Selecciona una opción para votar.
          </p>
        )}
      </div>

      <div className="space-y-3">
        {poll.options.map((option) => (
          <PollOption
            key={option.id}
            id={String(option.id)}
            content={option.text || option.content || ""}
            votes={option.votes || 0}
            percentage={getPercentage(option.votes || 0)}
            isSelected={String(option.id) === poll.user_vote || String(option.id) === userVote}
            hasVoted={hasVoted}
            isVoting={isPending}
            onVote={handleVote}
          />
        ))}
      </div>

      {hasVoted && (
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
          <span>{poll.total_votes} {poll.total_votes === 1 ? "voto" : "votos"}</span>
          <VotesDialog
            poll={poll}
            votes={votes}
            open={showVotesDialog}
            onOpenChange={setShowVotesDialog}
            onLoadVotes={loadVotes}
            getPercentage={getPercentage}
          />
        </div>
      )}
    </div>
  );
}
