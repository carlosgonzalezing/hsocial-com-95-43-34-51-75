
import { Poll } from "@/types/post";
import { PollDisplay } from "./PollDisplay";

interface PostPollProps {
  poll: Poll;
  postId: string;
}

export function PostPoll({ poll, postId }: PostPollProps) {
  return <PollDisplay poll={poll} postId={postId} />;
}
