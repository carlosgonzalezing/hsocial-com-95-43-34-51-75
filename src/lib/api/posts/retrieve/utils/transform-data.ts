
import type { Post } from "@/types/post";

export function transformPostsData(posts: any[]): Post[] {
  return posts.map(transformPostData);
}

export function transformPostData(post: any): Post {
  // Transform post data into the expected format
  return {
    id: post.id,
    content: post.content,
    created_at: post.created_at,
    updated_at: post.updated_at,
    user_id: post.user_id,
    profiles: post.profiles,
    media_url: post.media_url,
    media_type: post.media_type,
    reactions: post.reactions,
    poll: post.poll,
    idea: post.idea,
    comments_count: post.comments?.[0]?.count || 0,
    shared_post_id: post.shared_post_id,
    shared_from: post.shared_from,
    visibility: post.visibility,
    is_pinned: post.is_pinned,
    // If there's a shared post, transform it too
    shared_post: post.shared_post ? transformPostData(post.shared_post) : undefined
  };
}

export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
