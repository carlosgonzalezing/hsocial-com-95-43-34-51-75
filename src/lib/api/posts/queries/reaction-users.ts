import { supabase } from "@/integrations/supabase/client";

export interface ReactionUser {
  user_id: string;
  reaction_type: string;
  created_at: string;
  profile: {
    username: string;
    avatar_url: string | null;
  } | null;
}

export async function getPostReactionUsers(postId: string) {
  try {
    const { data, error } = await supabase
      .from("reactions")
      .select(`
        user_id,
        reaction_type,
        created_at,
        profiles:user_id(username, avatar_url)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      user_id: item.user_id,
      reaction_type: item.reaction_type,
      created_at: item.created_at,
      profile: item.profiles as any
    })) as ReactionUser[];
  } catch (error) {
    console.error("Error fetching reaction users:", error);
    return [];
  }
}