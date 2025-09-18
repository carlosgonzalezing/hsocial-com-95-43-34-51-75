
import { supabase } from "@/integrations/supabase/client";

export async function fetchPostComments(postId: string) {
  try {
    let { data: comments, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url,
          id
        ),
        reactions:reactions (*)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return comments || [];
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

export async function createComment(postId: string, content: string, parentId?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("comments")
      .insert({
        content,
        user_id: user.id,
        post_id: postId,
        parent_id: parentId || null
      })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, error };
  }
}
