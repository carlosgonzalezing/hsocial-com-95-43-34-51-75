import { supabase } from "@/integrations/supabase/client";
import type { Post } from "@/types/post";

export async function getSavedPosts(): Promise<Post[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase.rpc('get_saved_posts', {
      user_id_param: user.id,
      limit_count: 20,
      offset_count: 0
    });

    if (error) throw error;

    // Transform the data to match Post type
    return data?.map((post: any) => ({
      ...post,
      author_id: post.user_id,
      author: {
        id: post.user_id,
        username: post.username,
        avatar_url: post.avatar_url
      },
      saved_at: post.saved_at
    })) || [];
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    throw error;
  }
}

export async function toggleSavedPost(postId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('toggle_saved_post', {
      post_id_param: postId
    });

    if (error) throw error;
    return data; // Returns true if saved, false if unsaved
  } catch (error) {
    console.error("Error toggling saved post:", error);
    throw error;
  }
}

export async function isPostSaved(postId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error("Error checking if post is saved:", error);
    return false;
  }
}