
import { Button } from "@/components/ui/button";
import { BarChartBig, SparklesIcon, BookOpen, MessageCircle } from "lucide-react";

type PostType = 'regular' | 'poll' | 'idea' | 'marketplace';

interface PostCreatorHeaderProps {
  postType: PostType;
  setPostType: (type: PostType) => void;
}

export function PostCreatorHeader({ 
  postType, 
  setPostType 
}: PostCreatorHeaderProps) {
  return (
    <div className="flex items-center gap-1 pb-3 border-b overflow-x-auto scrollbar-hide">
      <Button
        variant={postType === 'regular' ? "default" : "ghost"}
        size="sm"
        onClick={() => setPostType('regular')}
        className="flex items-center gap-1 px-2 py-1 min-w-fit text-xs whitespace-nowrap"
      >
        <MessageCircle className="h-3 w-3" />
        <span className="hidden xs:inline">Regular</span>
      </Button>
      
      <Button
        variant={postType === 'poll' ? "default" : "ghost"}
        size="sm"
        onClick={() => setPostType('poll')}
        className="flex items-center gap-1 px-2 py-1 min-w-fit text-xs whitespace-nowrap"
      >
        <BarChartBig className="h-3 w-3" />
        <span className="hidden xs:inline">Encuesta</span>
      </Button>
      
      <Button
        variant={postType === 'idea' ? "default" : "ghost"}
        size="sm"
        onClick={() => setPostType('idea')}
        className="flex items-center gap-1 px-2 py-1 min-w-fit text-xs whitespace-nowrap"
      >
        <SparklesIcon className="h-3 w-3" />
        <span className="hidden xs:inline">Idea</span>
      </Button>
      
      <Button
        variant={postType === 'marketplace' ? "default" : "ghost"}
        size="sm"
        onClick={() => setPostType('marketplace')}
        className="flex items-center gap-1 px-2 py-1 min-w-fit text-xs whitespace-nowrap"
      >
        <BookOpen className="h-3 w-3" />
        <span className="hidden xs:inline">Market</span>
      </Button>
    </div>
  );
}
