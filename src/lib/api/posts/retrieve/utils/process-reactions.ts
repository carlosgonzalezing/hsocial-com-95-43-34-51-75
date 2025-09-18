
/**
 * Processes reactions data for posts
 */
export async function processReactions(posts: any[], userId?: string) {
  return posts.map(post => {
    // Initialize reaction data structure
    const reactionSummary = {
      count: 0,
      by_type: {} as Record<string, number>,
      recent_users: [] as string[]
    };
    
    // Process reactions if they exist
    if (Array.isArray(post.reactions) && post.reactions.length > 0) {
      reactionSummary.count = post.reactions.length;
      
      // Count by reaction type
      post.reactions.forEach((reaction: any) => {
        const type = reaction.reaction_type;
        if (!reactionSummary.by_type[type]) {
          reactionSummary.by_type[type] = 0;
        }
        reactionSummary.by_type[type]++;
        
        // Track user IDs for recent reactions
        if (reaction.user_id) {
          reactionSummary.recent_users.push(reaction.user_id);
        }
      });
      
      // Check if current user has reacted
      const userReaction = userId ? 
        post.reactions.find((r: any) => r.user_id === userId)?.reaction_type : 
        null;
        
      // Add the reaction data to the post
      return {
        ...post,
        reactions: reactionSummary,
        user_reaction: userReaction
      };
    }
    
    return {
      ...post,
      reactions: reactionSummary,
      user_reaction: null
    };
  });
}
