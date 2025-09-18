import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageSquare, Share2 } from "lucide-react";

interface ReelFooterProps {
  postId: string;
  userId: string;
}

export function ReelFooter({ postId, userId }: ReelFooterProps) {
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchInitialData = async () => {
      const existingReaction = await useExistingReaction(postId, userId);
      setHasLiked(!!existingReaction);
    };

    fetchInitialData();
  }, [postId, userId]);

  const useExistingReaction = async (postId: string, userId: string) => {
    const { data } = await (supabase as any)
      .from('reactions')
      .select('reaction_type')
      .eq('post_id' as any, postId as any)
      .eq('user_id' as any, userId as any)
      .maybeSingle();
    return (data as any)?.reaction_type as string | undefined;
  };

  return (
    <div className="absolute bottom-0 left-0 w-full p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button onClick={() => setHasLiked(!hasLiked)}>
          {hasLiked ? (
            <Heart fill="white" color="red" className="h-6 w-6" />
          ) : (
            <Heart className="h-6 w-6" />
          )}
        </button>
        <button>
          <MessageSquare className="h-6 w-6" />
        </button>
      </div>
      <div>
        <button>
          <Share2 className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
