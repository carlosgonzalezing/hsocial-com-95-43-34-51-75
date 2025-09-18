
import { Idea } from "@/types/post";
import { IdeaContent } from "./IdeaContent";

interface PostIdeaProps {
  idea: Idea;
  postId: string;
}

export function PostIdea({ idea, postId }: PostIdeaProps) {
  // We just pass the idea to the IdeaContent component
  return <IdeaContent idea={idea} />;
}
