
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Poll, type PollOption } from "@/types/post";

export interface VoteWithUser {
  id?: string;
  option_id: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
  created_at: string;
}

interface VotersListProps {
  poll: Poll;
  votes: VoteWithUser[];
  filterByOption?: string;
  getPercentage: (votes: number) => number;
}

export function VotersList({ poll, votes, filterByOption, getPercentage }: VotersListProps) {
  const filteredVotes = filterByOption
    ? votes.filter(vote => String(vote.option_id) === String(filterByOption))
    : votes;

  const getOptionText = (optionId: string) => {
    const option = poll.options.find(opt => String(opt.id) === String(optionId));
    return option ? (option.text || option.content || "") : "Opción desconocida";
  };

  if (votes.length === 0) {
    return <p className="text-muted-foreground text-sm">Aún no hay votos</p>;
  }

  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
      {filteredVotes.map((vote, index) => (
        <div key={index} className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={vote.profiles?.avatar_url} />
            <AvatarFallback>
              {vote.profiles?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{vote.profiles?.username}</span>
            {!filterByOption && (
              <span className="text-xs text-muted-foreground">
                Votó: {getOptionText(vote.option_id)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
