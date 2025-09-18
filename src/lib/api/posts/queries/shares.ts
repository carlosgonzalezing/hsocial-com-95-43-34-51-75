import { supabase } from "@/integrations/supabase/client";

export async function getPostSharesCount(postId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('post_shares')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) {
      console.error('Error getting shares count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getPostSharesCount:', error);
    return 0;
  }
}

export async function getMultiplePostSharesCounts(postIds: string[]): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from('post_shares')
      .select('post_id')
      .in('post_id', postIds);

    if (error) {
      console.error('Error getting multiple shares counts:', error);
      const sharesCounts: Record<string, number> = {};
      postIds.forEach(id => sharesCounts[id] = 0);
      return sharesCounts;
    }

    // Count shares for each post
    const sharesCounts: Record<string, number> = {};
    postIds.forEach(id => sharesCounts[id] = 0);
    
    if (data) {
      data.forEach(share => {
        sharesCounts[share.post_id] = (sharesCounts[share.post_id] || 0) + 1;
      });
    }

    return sharesCounts;
  } catch (error) {
    console.error('Error in getMultiplePostSharesCounts:', error);
    const sharesCounts: Record<string, number> = {};
    postIds.forEach(id => sharesCounts[id] = 0);
    return sharesCounts;
  }
}

export async function sharePost(postId: string, shareType: 'profile' | 'link' | 'external' = 'profile', shareComment?: string): Promise<boolean> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('post_shares')
      .insert({
        post_id: postId,
        user_id: userId,
        share_type: shareType,
        share_comment: shareComment
      });

    if (error) {
      console.error('Error sharing post:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in sharePost:', error);
    return false;
  }
}