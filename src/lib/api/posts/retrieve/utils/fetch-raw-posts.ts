
import { supabase } from "@/integrations/supabase/client";

export async function fetchRawPosts(userId?: string) {
  try {
    console.log('📊 fetchRawPosts: Starting fetch', { userId });
    
    let query = supabase
      .from("posts")
      .select(`
        *,
        profiles:profiles(*),
        reactions:reactions(*),
        comments:comments(count),
        post_reports:post_reports(count)
      `);

    // Si hay un userId, solo obtener los posts de ese usuario
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false });

    if (error) {
      console.error('❌ fetchRawPosts error:', error);
      throw error;
    }
    
    console.log('✅ fetchRawPosts: Success', { count: data?.length || 0 });
    return data || [];
  } catch (error) {
    console.error("❌ Error in fetchRawPosts:", error);
    throw error;
  }
}
