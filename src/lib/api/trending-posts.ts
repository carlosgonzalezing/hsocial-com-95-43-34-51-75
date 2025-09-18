import { supabase } from "@/integrations/supabase/client";
import type { Post } from "@/types/post";

export async function getTrendingPosts(limit: number = 20): Promise<Post[]> {
  try {
    // Get posts from the last 7 days with their interaction counts
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url
        ),
        reactions:likes!post_id (
          id,
          reaction_type
        ),
        comments (
          id
        )
      `)
      .eq('visibility', 'public')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate trending score for each post
    const postsWithScore = data?.map((post: any) => {
      const reactionCount = post.reactions?.length || 0;
      const commentCount = post.comments?.length || 0;
      const hoursAgo = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
      
      // Trending score: (reactions * 2 + comments * 3) / (hours + 1)
      // This gives more weight to recent posts with high engagement
      const trendingScore = (reactionCount * 2 + commentCount * 3) / (hoursAgo + 1);
      
      return {
        ...post,
        author_id: post.user_id,
        author: post.profiles,
        trending_score: trendingScore,
        reaction_count: reactionCount,
        comment_count: commentCount
      };
    }) || [];

    // Sort by trending score and return top posts
    return postsWithScore
      .sort((a, b) => b.trending_score - a.trending_score)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    throw error;
  }
}

export async function getTopPostsToday(limit: number = 10): Promise<Post[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          avatar_url
        ),
        reactions:likes!post_id (
          id
        ),
        comments (
          id
        )
      `)
      .eq('visibility', 'public')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Sort by total interactions
    const postsWithInteractions = data?.map((post: any) => ({
      ...post,
      author_id: post.user_id,
      author: post.profiles,
      total_interactions: (post.reactions?.length || 0) + (post.comments?.length || 0)
    })) || [];

    return postsWithInteractions
      .sort((a, b) => b.total_interactions - a.total_interactions)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching top posts today:", error);
    throw error;
  }
}