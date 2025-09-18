import React from "react";
import { Post as PostComponent } from "@/components/Post";
import { OpportunityPostCard } from "@/components/opportunities/OpportunityPostCard";
import type { Post } from "@/types/post";

interface UnifiedPostCardProps {
  post: Post;
  isInFeed?: boolean;
  trackPostView?: (postId: string, duration?: number) => void;
  trackPostInteraction?: (postId: string, type: 'like' | 'comment' | 'share') => void;
}

// Import the OpportunityData type from the OpportunityPostCard
import type { OpportunityData } from "@/components/opportunities/OpportunityPostCard";

export function UnifiedPostCard({ 
  post, 
  isInFeed = false,
  trackPostView,
  trackPostInteraction 
}: UnifiedPostCardProps) {
  
  // Handle opportunities (posts with post_type = 'opportunity')
  if (post.post_type === 'opportunity') {
    // Transform post data to opportunity format
    const opportunityData: OpportunityData = {
      id: post.id,
      type: determineOpportunityType(post),
      title: extractTitleFromContent(post.content || ''),
      description: post.content || '',
      created_at: post.created_at,
      author: {
        username: post.profiles?.username || 'Usuario',
        avatar_url: post.profiles?.avatar_url
      },
      // Additional opportunity-specific fields can be extracted from post data
      company_name: extractCompanyName(post.content || ''),
      location: extractLocation(post.content || ''),
    };

    return (
      <div className="mb-0 w-full">
        <OpportunityPostCard 
          opportunity={opportunityData} 
          onAction={(id, type) => {
            trackPostInteraction?.(id, type as 'like' | 'comment' | 'share');
          }} 
        />
      </div>
    );
  }

  // Handle regular posts
  return (
    <div className="mb-0 w-full">
      <PostComponent 
        post={post}
      />
    </div>
  );
}

// Helper functions to extract opportunity data from post content
function determineOpportunityType(post: Post): 'mentorship' | 'internship' | 'event' | 'job' {
  const content = post.content?.toLowerCase() || '';
  
  if (content.includes('mentoría') || content.includes('mentor')) return 'mentorship';
  if (content.includes('práctica') || content.includes('internship')) return 'internship';
  if (content.includes('evento') || content.includes('seminario') || content.includes('conferencia')) return 'event';
  if (content.includes('empleo') || content.includes('trabajo') || content.includes('job')) return 'job';
  
  return 'job'; // default
}

function extractTitleFromContent(content: string): string {
  const lines = content.split('\n');
  return lines[0] || content.substring(0, 100) + (content.length > 100 ? '...' : '');
}

function extractCompanyName(content: string): string {
  // Look for company names in the first line (format: "Company - Position")
  const firstLine = content.split('\n')[0];
  const dashIndex = firstLine.indexOf(' - ');
  return dashIndex > -1 ? firstLine.substring(0, dashIndex) : '';
}

function extractLocation(content: string): string {
  // Simple location extraction (could be improved with better parsing)
  const locationKeywords = ['bogotá', 'medellín', 'cali', 'barranquilla', 'cartagena', 'remoto', 'remote'];
  const contentLower = content.toLowerCase();
  
  for (const location of locationKeywords) {
    if (contentLower.includes(location)) {
      return location.charAt(0).toUpperCase() + location.slice(1);
    }
  }
  
  return '';
}